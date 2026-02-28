import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable } from "./data-table";

describe("DataTable", () => {
  it("renders rows and pagination metadata", () => {
    render(
      <DataTable
        columns={[
          { key: "id", label: "ID", sortable: true },
          { key: "name", label: "이름", sortable: true },
        ]}
        rows={[
          { id: "1", name: "A" },
          { id: "2", name: "B" },
        ]}
      />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/총 2건/)).toBeInTheDocument();
  });
});
