/*
  Copyright 2021 Kidus Tiliksew

  This file is part of Tensor EMR.

  Tensor EMR is free software: you can redistribute it and/or modify
  it under the terms of the version 2 of GNU General Public License as published by
  the Free Software Foundation.

  Tensor EMR is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import React, { useState, useRef, useEffect, Fragment } from "react";
import { Transition } from "@headlessui/react";
import PrintFileHeader from "../../components/PrintFileHeader";
import {
  Appointment,
  MutationUpdatePatientChartArgs,
  PatientChartUpdateInput,
  Query,
} from "../../models/models";
import { useReactToPrint } from "react-to-print";
import { gql, useMutation, useQuery } from "@apollo/client";
import { format, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import useExitPrompt from "../../useExitPrompt";
import { AUTO_SAVE_INTERVAL } from "../..";
import _ from "lodash";
import { useNotificationDispatch } from "../../notification";
import { Prompt } from "react-router-dom";
import { getPatientAge } from "../../util";

const UPDATE_PATIENT_CHART = gql`
  mutation UpdatePatientChart($input: PatientChartUpdateInput!) {
    updatePatientChart(input: $input) {
      id
      rightSummarySketch
      leftSummarySketch
    }
  }
`;

const GET_DETAILS = gql`
  query GetPatientChart(
    $patientChartId: ID!
    $details: Boolean
    $page: PaginationInput!
    $filter: OrderFilterInput
  ) {
    patientChart(id: $patientChartId, details: $details) {
      id
      diagnosisNote
      stickieNote
      summaryNote
      medicalRecommendation
      sickLeave

      diagnosticProcedureOrder {
        status
        createdAt
        diagnosticProcedures {
          id
          diagnosticProcedureTypeTitle
          diagnosticProcedureType {
            title
          }
        }
      }

      labOrder {
        status
        createdAt
        labs {
          id
          labType {
            id
            title
          }
        }
      }

      diagnoses {
        id
        differential
        location
        categoryCode
        diagnosisCode
        fullCode
        fullDescription
      }
    }

    orders(page: $page, filter: $filter) {
      totalCount
      pageInfo {
        totalPages
      }
      edges {
        node {
          id
          user {
            id
            firstName
            lastName
          }
          firstName
          lastName
          phoneNo
          patientId
          emergency
          note
          status
          orderType
          payments {
            id
            invoiceNo
            status
            billing {
              id
              item
              code
              price
              credit
            }
          }
          createdAt
        }
      }
    }
  }
`;

export const MedicalCertificatePage: React.FC<{
  appointment: Appointment;
}> = ({ appointment }) => {
  const notifDispatch = useNotificationDispatch();

  const [showPrintButton, setShowPrintButton] = useState<boolean>(false);
  const componentRef = useRef<any>();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const { register, getValues } = useForm<PatientChartUpdateInput>({
    defaultValues: {
      medicalRecommendation: appointment.patientChart.medicalRecommendation,
      sickLeave: appointment.patientChart.sickLeave,
    },
  });

  const [timer, setTimer] = useState<any>(null);
  const [modified, setModified] = useState<boolean>(false);
  const [showExitPrompt, setShowExitPrompt] = useExitPrompt(false);

  const { data, refetch, error } = useQuery<Query, any>(GET_DETAILS, {
    variables: {
      patientChartId: appointment.patientChart.id,
      details: true,
      page: { page: 0, size: 50 },
      filter: {
        patientChartId: appointment.patientChart.id,
      },
    },
  });

  useEffect(() => {
    refetch();
  }, []);

  const getOrderTypeName = (orderType: string | undefined) => {
    switch (orderType) {
      case "FOLLOW_UP":
        return "Follow-Up";
      case "PATIENT_IN_HOUSE_REFERRAL":
        return "In-House Referral";
      case "PATIENT_OUTSOURCE_REFERRAL":
        return "Outsourced Referral";
      case "TREATMENT":
        return "Treatment";
      case "SURGICAL_PROCEDURE":
        return "Surgery";
      default:
        return "";
    }
  };

  const [updatePatientChart] = useMutation<any, MutationUpdatePatientChartArgs>(
    UPDATE_PATIENT_CHART,
    {
      onCompleted() {
        setModified(false);
        setShowExitPrompt(false);
        refetch();
      },
      onError(error) {
        notifDispatch({
          type: "show",
          notifTitle: "Error",
          notifSubTitle: error.message,
          variant: "failure",
        });
      },
    }
  );

  const diagnosticProcedures =
    data?.patientChart.diagnosticProcedureOrder?.diagnosticProcedures
      .map((e) => e.diagnosticProcedureType.title)
      .join(", ");
  const labs = data?.patientChart.labOrder?.labs
    .map((e) => e.labType.title.trim())
    .join(", ");

  const orders = data?.orders?.edges
    .filter(
      (e) =>
        e?.node.orderType === "TREATMENT" ||
        e?.node.orderType === "SURGICAL_PROCEDURE"
    )
    .map(
      (e) =>
        `${e?.node.payments
          .map((p) => p.billing.item)
          .join(", ")} (${getOrderTypeName(e?.node.orderType)})`
    )
    .join(", ");

  let treatments = [];

  if (diagnosticProcedures?.length ?? 0 > 0)
    treatments.push(diagnosticProcedures);
  if (labs?.length ?? 0 > 0) treatments.push(labs);
  // if (orders?.length ?? 0 > 0) treatments.push(orders);

  const handleChanges = () => {
    setModified(true);
    setShowExitPrompt(true);

    clearTimeout(timer);

    const data = getValues();
    const isEmpty = _.values(data).every((v) => _.isEmpty(v));

    setTimer(
      setTimeout(() => {
        if (appointment?.patientChart.id !== undefined && !isEmpty) {
          const input = {
            ...data,
            id: appointment.patientChart.id,
          };

          updatePatientChart({ variables: { input } });
        }
      }, AUTO_SAVE_INTERVAL)
    );
  };

  return (
    <div className="bg-gray-500 p-4">
      <div
        className="relative mt-5 text-sm"
        onMouseEnter={() => setShowPrintButton(true)}
        onMouseLeave={() => setShowPrintButton(false)}
      >
        <Prompt
          when={modified}
          message="This page has unsaved data. Please click cancel and try again"
        />

        <div className="bg-white p-6 " ref={componentRef}>
          <PrintFileHeader
            qrUrl={`http://${window.__RUNTIME_CONFIG__.REACT_APP_SERVER_URL}/#/appointments/${appointment.id}/patient-dashboard`}
          />

          <hr className="border border-solid border-teal-500 bg-teal-400 mt-5" />

          <p className="text-2xl text-gray-700 text-center mt-4">
            Medical Certificate
          </p>

          <CertificateDetail
            title="Patient"
            body={`${appointment.patient.firstName} ${appointment.patient.firstName}`}
          />
          <CertificateDetail
            title="Electronic ID"
            body={appointment.patient.id}
          />
          <div className="flex space-x-6">
            <div className="flex-1">
              <CertificateDetail
                title="Age"
                body={
                  appointment && getPatientAge(appointment?.patient.dateOfBirth)
                }
              />
            </div>
            <div className="flex-1">
              <CertificateDetail
                title="Gender"
                body={appointment.patient.gender}
              />
            </div>
          </div>
          <CertificateDetail
            title="Diagnosis"
            body={
              data?.patientChart.diagnoses
                ?.map(
                  (e) =>
                    `${e?.fullDescription} ${
                      e?.location && `(${e?.location})`
                    } `
                )
                .join(", ") ?? ""
            }
          />
          <CertificateDetail
            title="Treatments/Procedures"
            body={treatments.join(", ")}
          />
          <div className="mt-4">
            <div className="w-full bg-gray-100 p-2">Recommendation</div>
            <div className="mt-1">
              <textarea
                name="medicalRecommendation"
                ref={register}
                rows={2}
                className="mt-1 p-1 pl-4 block w-full sm:text-md border-none"
                onChange={handleChanges}
                placeholder="Recommendations"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-100 p-2">Sick leave</div>
            <div className="mt-1">
              <textarea
                name="sickLeave"
                ref={register}
                rows={1}
                placeholder="Sick leave"
                className="mt-1 p-1 pl-4 block w-full sm:text-md border-none"
                onChange={handleChanges}
              />
            </div>
          </div>

          <CertificateDetail
            title="Date"
            body={
              appointment.checkedInTime &&
              format(parseISO(appointment.checkedInTime), "MMM d, y")
            }
          />
          <CertificateDetail
            title="Provider"
            body={`Dr. ${appointment.providerName}`}
          />
        </div>
        <Transition.Root
          show={showPrintButton}
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute top-4 right-5">
            <button
              type="button"
              className="text-sm tracking-wide text-teal-800 hover:bg-teal-700 hover:text-white subpixel-antialiased px-5 py-2 rounded-lg flex items-center space-x-2 border"
              onClick={handlePrint}
            >
              <span className="material-icons">print</span>
              <div>Print this</div>
            </button>
          </div>
        </Transition.Root>
      </div>
    </div>
  );
};

const CertificateDetail = ({
  title,
  body,
}: {
  title: string;
  body: string;
}) => {
  return (
    <div className="mt-3">
      <div className="w-full bg-gray-100 p-2">{title}</div>
      <div className="mt-1 ml-1">{body}</div>
    </div>
  );
};
