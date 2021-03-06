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

import { gql, useLazyQuery } from "@apollo/client";
import { parseISO } from "date-fns";
import { debounce } from "lodash-es";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  QuerySearchArgs,
  Maybe,
  Patient,
  Query,
  User,
  Page,
} from "@tensoremr/models";
import SearchBarAppointments from "./SearchBarAppointments";
import SearchBarMedications from "./SearchBarMedications";
import ReactLoading from "react-loading";

const SEARCH = gql`
  query SearchPatient($searchTerm: String!) {
    search(searchTerm: $searchTerm) {
      patients {
        id
        firstName
        lastName
        phoneNo
      }

      providers {
        id
        firstName
        lastName
      }
    }
  }
`;

interface Props {
  searchFocused: boolean;
  onChangePage: (route: string) => void;
  onAddPage: (page: Page) => void;
  setSearchFocused: (focused: boolean) => void;
}

export const SearchBar: React.FC<Props> = ({
  searchFocused,
  setSearchFocused,
  onAddPage,
}) => {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const searchQuery = useLazyQuery<Query, QuerySearchArgs>(SEARCH);

  useEffect(() => {
    if (debouncedSearchTerm.trim().length > 0) {
      searchQuery[0]({
        variables: {
          searchTerm: debouncedSearchTerm,
        },
      });
    } else {
      searchQuery[0]({
        variables: {
          searchTerm: "",
        },
      });
    }
  }, [debouncedSearchTerm]);

  const debouncer = useCallback(
    debounce((_searchVal: string) => {
      setDebouncedSearchTerm(_searchVal);
    }, 500),
    []
  );

  const handlePatientClick = (patient: Maybe<Patient>) => {
    if (patient !== undefined) {
      setSearchFocused(false);
      setSearchTerm("");

      const page: Page = {
        title: `Patient - ${patient?.firstName} ${patient?.lastName}`,
        cancellable: true,
        route: `/patients/${patient?.id}/appointments`,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ),
      };

      onAddPage(page);
      history.replace(`/patients/${patient?.id}/appointments`);
    }
  };

  const handleProviderClick = (user: User) => {
    setSearchFocused(false);
    setSearchTerm("");

    const page: Page = {
      title: `Appointments`,
      cancellable: true,
      route: `/appointments?userId=${user.id}`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    };

    onAddPage(page);
    history.replace(`/appointments?userId=${user.id}`);
  };

  const hasPatients = (searchQuery[1].data?.search.patients.length ?? 0) > 0;
  const hasProviders = (searchQuery[1].data?.search.providers.length ?? 0) > 0;

  return (
    <div>
      <div className="relative z-20">
        <input
          type="search"
          className="bg-gray-600 focus:bg-white focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 placeholder-gray-300 h-10 w-full px-4 rounded-md sm:text-sm block border-none"
          placeholder="Search"
          aria-haspopup="listbox"
          aria-expanded="false"
          autoComplete="off"
          value={searchTerm}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            setSearchFocused(false);
            setSearchTerm("");
          }}
          onChange={(evt) => {
            setSearchTerm(evt.target.value);
            debouncer(evt.target.value);
          }}
        />
      </div>

      {searchQuery[1].loading && (
        <div className="origin-top-left mt-4 absolute z-20 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 text-center py-10">
          <p className="text-gray-700 animate-pulse tracking-wider">
            Searching...
          </p>
        </div>
      )}

      {(hasPatients || hasProviders) && searchFocused && (
        <div className="origin-top-left mt-4 absolute z-20 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-4">
          {hasPatients && (
            <div>
              <PatientResults
                patients={searchQuery[1].data?.search.patients}
                onClick={(e) => handlePatientClick(e)}
              />
            </div>
          )}

          {hasProviders && (
            <div className="mt-2">
              <ProviderResults
                providers={searchQuery[1].data?.search.providers}
                onClick={(e) => handleProviderClick(e)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SEARCH_ITEM_DETAILS = gql`
  query SearchItemDetails(
    $appointmentFilter: AppointmentFilter
    $medicalPrescriptionFilter: MedicalPrescriptionFilter
    $page: PaginationInput!
  ) {
    appointments(filter: $appointmentFilter, page: $page) {
      totalCount
      edges {
        node {
          id
          checkInTime
          visitType {
            id
            title
          }
          appointmentStatus {
            id
            title
          }
          providerName
        }
      }
    }

    searchMedicalPrescriptions(
      filter: $medicalPrescriptionFilter
      page: $page
    ) {
      totalCount
      edges {
        node {
          id
          medication
          sig
          refill
          generic
          substitutionAllowed
          directionToPatient
          history
          status
          prescribedDate
        }
      }
    }

    currentDateTime
  }
`;

function PatientResults({
  patients,
  onClick,
}: {
  patients: Patient[] | undefined;
  onClick: (e: Patient) => void;
}) {
  const searchItemDetailsQuery = useLazyQuery<Query, any>(SEARCH_ITEM_DETAILS);

  const [isHovered, setIsHovered] = useState({ hovered: false, id: null });

  const debouncedHandleMouseEnter = debounce(
    (hoverId) => setIsHovered({ hovered: true, id: hoverId }),
    500
  );

  const handlOnMouseLeave = () => {
    setIsHovered({ hovered: false, id: null });
    debouncedHandleMouseEnter.cancel();
  };

  useEffect(() => {
    if (isHovered.hovered) {
      searchItemDetailsQuery[0]({
        variables: {
          appointmentFilter: {
            patientId: isHovered.id,
          },
          medicalPrescriptionFilter: {
            patientId: isHovered.id,
            status: "Active",
          },
          page: { page: 1, size: 5 },
        },
      });
    }
  }, [isHovered]);

  const appointmentsLength =
    searchItemDetailsQuery[1].data?.appointments.edges.length ?? 0;

  const medicalPrescriptionsLength =
    searchItemDetailsQuery[1].data?.searchMedicalPrescriptions.edges.length ??
    0;

  return (
    <div>
      <p className="text-gray-600 text-lg font-semibold">Patients</p>

      {patients?.map((e) => (
        <div
          key={e?.id}
          onMouseDown={(evt) => {
            //evt.stopPropagation();
            onClick(e);
          }}
          onMouseEnter={() => {
            debouncedHandleMouseEnter(e?.id);
          }}
          onMouseLeave={() => {
            handlOnMouseLeave();
          }}
        >
          <div
            role="menu"
            area-orientation="vertical"
            area-labelledby="header-search"
          >
            <div className="mt-3 bg-gray-50 rounded-lg cursor-pointer group hover:bg-gray-600 hover:text-white">
              <div className="flex px-3 py-3 items-center ">
                <div className="flex flex-grow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-8 w-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-col ml-4">
                    <p className="text-lg text-gray-900 group-hover:text-white font-bold">
                      {`${e?.firstName} ${e?.lastName}`}
                    </p>
                    <p className="text-sm text-gray-500 group-hover:text-gray-100">
                      {e?.phoneNo}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold group-hover:text-white">
                    {e?.id}
                  </p>
                </div>
              </div>
              {isHovered.id === e?.id && searchItemDetailsQuery[1].loading && (
                <div className="pl-14 pr-4 pb-5">
                  <ReactLoading
                    type={"cylon"}
                    color={"white"}
                    height={30}
                    width={30}
                    className="inline-block"
                  />
                </div>
              )}

              {isHovered.id === e?.id &&
                (appointmentsLength > 0 || medicalPrescriptionsLength > 0) && (
                  <div className="pl-14 pr-4 pb-5">
                    <hr />
                    {appointmentsLength > 0 && (
                      <div className="mt-2">
                        <p className="font-light">Appointments</p>
                        <div className="mt-2" />
                        <div className="pl-10 ">
                          <SearchBarAppointments
                            appointments={searchItemDetailsQuery[1].data?.appointments.edges.map(
                              (e) => e?.node
                            )}
                            currentDateTime={parseISO(
                              searchItemDetailsQuery[1].data?.currentDateTime
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {medicalPrescriptionsLength > 0 && (
                      <div className="mt-2">
                        <p className="font-light mt-2">Medications</p>
                        <div className="mt-2" />
                        <div className="pl-10 ">
                          <SearchBarMedications
                            medicalPrescriptions={searchItemDetailsQuery[1].data?.searchMedicalPrescriptions.edges.map(
                              (e) => e?.node
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProviderResults({
  providers,
  onClick,
}: {
  providers: User[] | undefined;
  onClick: (e: User) => void;
}) {
  return (
    <div>
      <p className="text-gray-600 text-lg font-semibold">Doctors</p>

      {providers?.map((e) => (
        <div
          key={e?.id}
          onMouseDown={(evt) => {
            onClick(e);
          }}
        >
          <div
            role="menu"
            area-orientation="vertical"
            area-labelledby="header-search"
          >
            <div className="mt-3">
              <div className="flex px-3 py-3 bg-gray-100 rounded-lg cursor-pointer items-center group hover:bg-teal-400 hover:text-white">
                <div className="flex flex-grow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-8 w-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-col ml-4">
                    <p className="text-lg text-gray-900 group-hover:text-white font-bold">
                      {`Dr. ${e?.firstName} ${e?.lastName}`}
                    </p>
                  </div>
                </div>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
