import React from "react";
import { Container, Row, Col } from "reactstrap";

import BotpressTable from "../components/BotpressTable";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

export const TableComponent = () => {
  const { user } = useAuth0();

  return (
    <Container className="mb-5">
      <BotpressTable></BotpressTable>
    </Container>
  );
};

export default withAuthenticationRequired(TableComponent, {
  onRedirecting: () => <Loading />,
});
