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

import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Query,
  PaginationInput,
  QueryVisitTypesArgs,
  Maybe,
  VisitTypeEdge,
  VisitTypeInput,
  MutationSaveVisitTypeArgs,
  VisitType,
  MutationUpdateVisitTypeArgs,
  MutationDeleteVisitTypeArgs,
} from "@tensoremr/models";
import {
  useBottomSheetDispatch,
  useNotificationDispatch,
  TablePagination,
} from "@tensoremr/components";

const VISIT_TYPES = gql`
  query VisitTypes($page: PaginationInput!) {
    visitTypes(page: $page) {
      totalCount
      edges {
        node {
          id
          title
        }
      }
      pageInfo {
        totalPages
      }
    }
  }
`;

const ROWS_PER_PAGE = 5;

export const VisitTypesTable: React.FC = () => {
  const [paginationInput, setPaginationInput] = useState<PaginationInput>({
    page: 1,
    size: ROWS_PER_PAGE,
  });

  const bottomSheetDispatch = useBottomSheetDispatch();
  const notifDispatch = useNotificationDispatch();

  const { data, refetch } = useQuery<Query, QueryVisitTypesArgs>(VISIT_TYPES, {
    variables: { page: paginationInput },
  });

  useEffect(() => {
    refetch();
  }, [paginationInput]);

  const handleNextClick = () => {
    const totalPages = data?.visitTypes.pageInfo.totalPages ?? 0;

    if (totalPages > paginationInput.page) {
      setPaginationInput({
        ...paginationInput,
        page: paginationInput.page + 1,
      });
    }
  };

  const handlePreviousClick = () => {
    if (paginationInput.page > 1) {
      setPaginationInput({
        ...paginationInput,
        page: paginationInput.page - 1,
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 bg-gray-700 text-left text-sm font-medium text-gray-50 uppercase tracking-wider"
                  >
                    Visit Types
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 bg-gray-700 text-gray-100 text-right"
                  >
                    <button
                      onClick={() =>
                        bottomSheetDispatch({
                          type: "show",
                          snapPoint: 500,
                          children: (
                            <AddVisitTypeForm
                              onSuccess={() => {
                                bottomSheetDispatch({ type: "hide" });

                                notifDispatch({
                                  type: "show",
                                  notifTitle: "Success",
                                  notifSubTitle:
                                    "Visit Type has been saved successfully",
                                  variant: "success",
                                });

                                refetch();
                              }}
                              onCancel={() =>
                                bottomSheetDispatch({ type: "hide" })
                              }
                            />
                          ),
                        })
                      }
                      className="uppercase bg-gray-800 hover:bg-gray-900 py-1 px-2 rounded-md text-sm"
                    >
                      <div className="flex items-center">
                        <div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-6 w-6"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="font-semibold">Add</div>
                      </div>
                    </button>
                  </th>
                </tr>
                <tr>
                  <th colSpan={2}>
                    <input
                      type="text"
                      name="search"
                      id="search"
                      placeholder="Search"
                      className="p-1 pl-4 block w-full sm:text-md border-gray-300"
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.visitTypes.edges.map((value: Maybe<VisitTypeEdge>) => (
                  <tr key={value?.node.id} className="hover:bg-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {value?.node.title}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => {
                          bottomSheetDispatch({
                            type: "show",
                            snapPoint: 500,
                            children: (
                              <UpdateVisitTypeForm
                                onUpdateSuccess={() => {
                                  bottomSheetDispatch({ type: "hide" });

                                  notifDispatch({
                                    type: "show",
                                    notifTitle: "Success",
                                    notifSubTitle:
                                      "Visit type has been updated successfully",
                                    variant: "success",
                                  });

                                  refetch();
                                }}
                                onDeleteSuccess={() => {
                                  bottomSheetDispatch({ type: "hide" });

                                  notifDispatch({
                                    type: "show",
                                    notifTitle: "Success",
                                    notifSubTitle:
                                      "Visit type has been deleted successfully",
                                    variant: "success",
                                  });

                                  refetch();
                                }}
                                onCancel={() =>
                                  bottomSheetDispatch({ type: "hide" })
                                }
                                values={value?.node}
                              />
                            ),
                          });
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePagination
              totalCount={data?.visitTypes.totalCount ?? 0}
              onNext={handleNextClick}
              onPrevious={handlePreviousClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SAVE_VISIT_TYPE = gql`
  mutation SaveVisitType($input: VisitTypeInput!) {
    saveVisitType(input: $input) {
      id
      title
    }
  }
`;

interface AddVisitTypeProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddVisitTypeForm: React.FC<AddVisitTypeProps> = ({
  onSuccess,
  onCancel,
}) => {
  const notifDispatch = useNotificationDispatch();
  const { register, handleSubmit } = useForm<VisitTypeInput>();
  const [save, { error }] = useMutation<any, MutationSaveVisitTypeArgs>(
    SAVE_VISIT_TYPE,
    {
      onCompleted(data) {
        onSuccess();
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

  const onSubmit = (data: VisitTypeInput) => {
    save({ variables: { input: data } });
  };

  return (
    <div
      className="container mx-auto flex justify-center pt-4"
      style={{ height: "300px" }}
    >
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
            Add visit type
          </p>
          <div className="mt-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
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

const UPDATE_VISIT_TYPE = gql`
  mutation UpdateVisitType($input: VisitTypeInput!, $id: ID!) {
    updateVisitType(input: $input, id: $id) {
      id
      title
    }
  }
`;

const DELETE_VISIT_TYPE = gql`
  mutation DeleteVisitType($id: ID!) {
    deleteVisitType(id: $id)
  }
`;

interface UpdateVisitTypeProps {
  values: VisitType | undefined;
  onUpdateSuccess: () => void;
  onDeleteSuccess: () => void;
  onCancel: () => void;
}

const UpdateVisitTypeForm: React.FC<UpdateVisitTypeProps> = ({
  values,
  onUpdateSuccess,
  onDeleteSuccess,
  onCancel,
}) => {
  const notifDispatch = useNotificationDispatch();
  const { register, handleSubmit, setValue } = useForm<VisitTypeInput>();
  const [save, { error }] = useMutation<any, MutationUpdateVisitTypeArgs>(
    UPDATE_VISIT_TYPE,
    {
      onCompleted(data) {
        onUpdateSuccess();
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

  const [deleteVisitType] = useMutation<any, MutationDeleteVisitTypeArgs>(
    DELETE_VISIT_TYPE,
    {
      onCompleted(data) {
        onDeleteSuccess();
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

  useEffect(() => {
    setValue("title", values?.title ?? "");
  }, [values]);

  const onUpdateSubmit = (data: VisitTypeInput) => {
    const id: string = values?.id.toString() ?? "";
    save({ variables: { id: id, input: data } });
  };

  const onDeleteSubmit = (data: VisitTypeInput) => {
    const id: string = values?.id.toString() ?? "";
    deleteVisitType({ variables: { id: id } });
  };

  return (
    <div
      className="container mx-auto flex justify-center pt-4"
      style={{ height: "300px" }}
    >
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
        <form>
          <p className="text-2xl font-extrabold tracking-wider">
            Add visit type
          </p>
          <div className="mt-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              ref={register({ required: true })}
              className="mt-1 p-1 pl-4 block w-full sm:text-md border-gray-300 border rounded-md"
            />
          </div>
          <div className="mt-4">
            {error && <p className="text-red-600">Error: {error.message}</p>}
          </div>
          <div className="flex space-x-5">
            <button
              type="button"
              onClick={handleSubmit(onUpdateSubmit)}
              className="inline-flex justify-center w-full py-2 px-4 mt-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 focus:outline-none"
            >
              <span className="ml-2">Update</span>
            </button>

            <button
              type="submit"
              onClick={handleSubmit(onDeleteSubmit)}
              className="inline-flex justify-center w-full py-2 px-4 mt-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 focus:outline-none"
            >
              <span className="ml-2">Delete</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
