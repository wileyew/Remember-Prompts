import React from "react";
import { Container } from "reactstrap";

import BotpressTable from "../components/BotpressTable";
import Loading from "../components/Loading";

export const TableComponent = () => {
  // const { user } = useAuth0();

  return (
    <Container className="mb-5">
      <BotpressTable />
    </Container>
  );
};

export default TableComponent;
