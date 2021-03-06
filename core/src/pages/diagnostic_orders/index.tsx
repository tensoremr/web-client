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

import { gql, useQuery } from "@apollo/client";
import React, { useState, useEffect } from "react";
import { DiagnosticOrdersTable } from "./DiagnosticOrdersTable";
import {
  useNotificationDispatch,
  useBottomSheetDispatch,
  CompleteDiagnosticOrderForm,
  OrdersToolbar
} from "@tensoremr/components";
import {
  DiagnosticProcedureOrder,
  OrderFilterInput,
  PaginationInput,
  Query,
  QuerySearchDiagnosticProcedureOrdersArgs,
} from "@tensoremr/models";
import { useLocation } from "react-router-dom";

const SEARCH_DIAGNOSTIC_ORDERS = gql`
  query SearchDiagnosticOrders(
    $page: PaginationInput!
    $filter: DiagnosticProcedureOrderFilter
    $date: Time
    $searchTerm: String
  ) {
    searchDiagnosticProcedureOrders(
      page: $page
      filter: $filter
      date: $date
      searchTerm: $searchTerm
    ) {
      totalCount
      pageInfo {
        totalPages
      }
      edges {
        node {
          id
          firstName
          lastName
          phoneNo
          userName
          patientId
          orderedBy {
            id
            firstName
            lastName
            userTypes {
              title
            }
          }
          diagnosticProcedures {
            id
            diagnosticProcedureType {
              title
            }
            payments {
              id
              status
              invoiceNo
              billing {
                id
                item
                code
                price
                credit
              }
            }
            receptionNote
          }
          status
          createdAt
        }
      }
    }
  }
`;


function useRouterQuery() {
  return new URLSearchParams(useLocation().search);
}

export const DiagnosticOrdersPage: React.FC = () => {
  const query = useRouterQuery();
  const queryUserId = query.get("userId");
  const queryStatus = query.get("status");

  const bottomSheetDispatch = useBottomSheetDispatch();
  const notifDispatch = useNotificationDispatch();

  const [paginationInput, setPaginationInput] = useState<PaginationInput>({
    page: 1,
    size: 20,
  });

  const [filter, setFilter] = useState<OrderFilterInput>({
    date: new Date(),
    userId: queryUserId === null ? "all" : queryUserId,
    status: queryStatus === null ? "all" : queryStatus,
    searchTerm: "",
  });

  const { data, refetch } = useQuery<
    Query,
    QuerySearchDiagnosticProcedureOrdersArgs
  >(SEARCH_DIAGNOSTIC_ORDERS, {
    variables: {
      page: paginationInput,
      filter: {
        orderedById: filter.userId === "all" ? undefined : filter.userId,
        status: filter.status === "all" ? undefined : filter.status,
      },
      searchTerm:
        filter.searchTerm?.length === 0 ? undefined : filter.searchTerm,
      date: filter.date,
    },
    pollInterval: 10000,
  });

  useEffect(() => {
    refetch();
  }, [filter, paginationInput]);

  const handleClear = () => {
    setFilter({
      date: new Date(),
      userId: "all",
      status: "all",
    });
  };

  const handleNextClick = () => {
    const totalPages =
      data?.searchDiagnosticProcedureOrders.pageInfo.totalPages ?? 0;

    if (totalPages > paginationInput.page) {
      setPaginationInput({
        ...paginationInput,
        page: paginationInput.page + 1,
      });
    }
  };

  const handlePrevClick = () => {
    if (paginationInput.page > 1) {
      setPaginationInput({
        ...paginationInput,
        page: paginationInput.page - 1,
      });
    }
  };

  const handleOrderClick = (order: DiagnosticProcedureOrder) => {
    bottomSheetDispatch({
      type: "show",
      snapPoint: 0,
      children: (
        <CompleteDiagnosticOrderForm
          selectedOrder={order}
          onSuccess={() => {
            refetch();
            notifDispatch({
              type: "show",
              notifTitle: "Success",
              notifSubTitle: "Receipt printed successfully",
              variant: "success",
            });
            bottomSheetDispatch({ type: "hide" });
          }}
          onCancel={() => bottomSheetDispatch({ type: "hide" })}
          onRefresh={() => {
            refetch();
          }}
        />
      ),
    });
  };

  return (
    <div className="h-screen">
      <OrdersToolbar
        filter={filter}
        onClear={handleClear}
        onChange={setFilter}
      />

      <DiagnosticOrdersTable
        totalCount={data?.searchDiagnosticProcedureOrders.totalCount ?? 0}
        orders={
          data?.searchDiagnosticProcedureOrders.edges.map((e) => e.node) ?? []
        }
        onNext={handleNextClick}
        onPrev={handlePrevClick}
        onItemClick={handleOrderClick}
      />
    </div>
  );
};
