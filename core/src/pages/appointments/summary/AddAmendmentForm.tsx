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

import { gql, useMutation } from "@apollo/client";
import React from "react";
import { useForm } from "react-hook-form";
import { AmendmentInput, MutationCreateAmendmentArgs } from "@tensoremr/models";

const CREATE_AMENDMENT = gql`
  mutation CreateAmendment($input: AmendmentInput!) {
    createAmendment(input: $input) {
      id
    }
  }
`;

interface Props {
  patientChartId: string | undefined;
  onSuccess: () => void;
  onError: (message: string) => void;
  onCancel: () => void;
}

export const AddAmendmentForm: React.FC<Props> = ({
  patientChartId,
  onSuccess,
  onError,
  onCancel,
}) => {

  const { register, handleSubmit } = useForm<AmendmentInput>();

  const [createAmendment, { error }] = useMutation<
    any,
    MutationCreateAmendmentArgs
  >(CREATE_AMENDMENT, {
    onCompleted(data) {
      onSuccess();
    },
    onError(error) {
      onError(error.message);
    },
  });

  const onSubmit = (data: AmendmentInput) => {
    if (patientChartId) {
      data.patientChartId = patientChartId;
      createAmendment({ variables: { input: data } });
    }
  };

  return (
    <div className="container mx-auto flex justify-center pt-4 pb-6">
      <div className="w-1/2">
        <div className="float-right">
          <button onClick={onCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-8 w-8 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <p className="text-2xl font-extrabold tracking-wider text-teal-800">
            Add amendment
          </p>
          <div className="mt-4">
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-700"
            >
              Note
            </label>
            <textarea
              name="note"
              ref={register}
              rows={4}
              className="mt-1 p-1 pl-4 block w-full sm:text-md border-gray-300 border rounded-md"
            />
          </div>
          <div className="mt-4">
            {error && <p className="text-red-600">Error: {error.message}</p>}
          </div>
          <button
            type="submit"
            className="inline-flex justify-center w-full py-2 px-4 mt-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-700 hover:bg-teal-800 focus:outline-none"
          >
            <span className="ml-2">Save</span>
          </button>
        </form>
      </div>
    </div>
  );
};
