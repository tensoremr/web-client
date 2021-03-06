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

import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import {
  useBottomSheetDispatch,
  useNotificationDispatch,
  TablePagination,
} from "@tensoremr/components";
import {
  Maybe,
  PharmacyEdge,
  Query,
  QueryPharmaciesArgs,
} from "@tensoremr/models";
import { AddPharmacyForm } from "./AddPharmacyForm";
import { UpdatePharmacyForm } from "./UpdatePharmacyForm";

const PHARMACIES = gql`
  query Pharmacies($page: PaginationInput!) {
    pharmacies(page: $page) {
      totalCount
      edges {
        node {
          id
          title
          address
          region
          country
          phone
          inHouse
          active
        }
      }
      pageInfo {
        totalPages
      }
    }
  }
`;

export const PharmacyAdminPage: React.FC = () => {
  const bottomSheetDispatch = useBottomSheetDispatch();
  const notifDispatch = useNotificationDispatch();

  const [paginationInput, setPaginationInput] = useState({
    page: 1,
    size: 10,
  });

  const { data, refetch } = useQuery<Query, QueryPharmaciesArgs>(PHARMACIES, {
    variables: {
      page: paginationInput,
    },
  });

  useEffect(() => {
    refetch();
  }, [paginationInput]);

  const handleNextClick = () => {
    const totalPages = data?.pharmacies.pageInfo.totalPages ?? 0;

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
    <div className="w-full">
      <div className="overflow-x-auto">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  scope="col"
                  colSpan={4}
                  className="px-6 py-3 bg-gray-700 text-left text-xs font-medium text-gray-50 uppercase tracking-wider"
                >
                  Pharmacies
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 bg-gray-700 text-gray-100 text-right"
                >
                  <button
                    onClick={() => {
                      bottomSheetDispatch({
                        type: "show",
                        snapPoint: 0,
                        children: (
                          <AddPharmacyForm
                            onSuccess={() => {
                              bottomSheetDispatch({ type: "hide" });
                              notifDispatch({
                                type: "show",
                                notifTitle: "Success",
                                notifSubTitle:
                                  "Pharmacy has been added successfully",
                                variant: "success",
                              });
                              refetch();
                            }}
                            onError={(message) => {
                              notifDispatch({
                                type: "show",
                                notifTitle: "Error",
                                notifSubTitle: message,
                                variant: "failure",
                              });
                            }}
                            onCancel={() =>
                              bottomSheetDispatch({ type: "hide" })
                            }
                          />
                        ),
                      });
                    }}
                    className="uppercase bg-gray-800 hover:bg-gray-600 py-1 px-2 rounded-md text-sm"
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
                <th colSpan={5}>
                  <input
                    type="text"
                    name="search"
                    id="billings-search"
                    placeholder="Search"
                    className="p-3 pl-4 block w-full sm:text-md border-gray-300"
                  />
                </th>
              </tr>
              <tr className="bg-gray-50">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                >
                  Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                >
                  Active
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.pharmacies.edges.map((value: Maybe<PharmacyEdge>) => (
                <tr
                  key={value?.node.id}
                  className="border-b hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    bottomSheetDispatch({
                      type: "show",
                      snapPoint: 0,
                      children: (
                        <UpdatePharmacyForm
                          onUpdateSuccess={() => {
                            bottomSheetDispatch({ type: "hide" });

                            notifDispatch({
                              type: "show",
                              notifTitle: "Success",
                              notifSubTitle:
                                "Pharmacy has been updated successfully",
                              variant: "success",
                            });

                            refetch();
                          }}
                          onCancel={() => bottomSheetDispatch({ type: "hide" })}
                          values={value?.node}
                        />
                      ),
                    });
                  }}
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {value?.node.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {value?.node.address}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {value?.node.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {value?.node.inHouse ? "In-House" : "External"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {value?.node.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            totalCount={data?.pharmacies.totalCount ?? 0}
            onNext={handleNextClick}
            onPrevious={handlePreviousClick}
          />
        </div>
      </div>
    </div>
  );
};
