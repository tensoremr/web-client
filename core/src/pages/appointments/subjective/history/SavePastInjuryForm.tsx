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
import { PastInjuryInput, MutationSavePastInjuryArgs } from "@tensoremr/models";
import { useNotificationDispatch } from "@tensoremr/components";
import { formatDate } from "@tensoremr/util";

const SAVE_PAST_INJURY = gql`
  mutation SavePastInjury($input: PastInjuryInput!) {
    savePastInjury(input: $input) {
      id
    }
  }
`;

export const SavePastInjuryForm: React.FC<{
  patientHistoryId: string | undefined;
  onSuccess: () => void;
  onCancel: () => void;
  onSaveChange?: (saving: boolean) => void;
}> = ({ patientHistoryId, onSuccess, onCancel, onSaveChange }) => {
  const notifDispatch = useNotificationDispatch();
  const { register, handleSubmit } = useForm<PastInjuryInput>();

  const [save, { error }] = useMutation<any, MutationSavePastInjuryArgs>(
    SAVE_PAST_INJURY,
    {
      onCompleted(data) {
        onSaveChange && onSaveChange(false);
        onSuccess();
      },
      onError(error) {
        onSaveChange && onSaveChange(false);
        notifDispatch({
          type: "show",
          notifTitle: "Error",
          notifSubTitle: error.message,
          variant: "failure",
        });
      },
    }
  );

  const onSubmit = (data: PastInjuryInput) => {
    if (patientHistoryId !== undefined) {
      data.patientHistoryId = patientHistoryId;
      data.injuryDate = formatDate(data.injuryDate);

      onSaveChange && onSaveChange(true);
      save({ variables: { input: data } });
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
          <p className="text-2xl font-extrabold tracking-wider">
            Add Past Injury
          </p>
          <div className="mt-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Injury
            </label>
            <input
              type="text"
              name="description"
              id="description"
              required
              ref={register({ required: true })}
              className="mt-1 p-1 pl-4 block w-full sm:text-md border-gray-300 border rounded-md"
            />
          </div>
          <div className="mt-4">
            <label
              htmlFor="injuryDate"
              className="block text-sm font-medium text-gray-700"
            >
              Injury date
            </label>
            <input
              type="date"
              name="injuryDate"
              id="injuryDate"
              required
              ref={register({ required: true })}
              className="mt-1 p-1 pl-4 block w-full sm:text-md border-gray-300 border rounded-md"
            />
          </div>
          <div className="mt-4">
            {error && <p className="text-red-600">Error: {error.message}</p>}
          </div>
          <button
            type="submit"
            className="inline-flex justify-center w-full py-2 px-4 mt-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 focus:outline-none"
          >
            <span className="ml-2">Save</span>
          </button>
        </form>
      </div>
    </div>
  );
};
