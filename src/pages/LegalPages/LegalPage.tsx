import SiteWrapper from "../../SiteWrapper";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Container } from "react-bootstrap";

import "./LegalPage.scss";

const LegalPage = ({ title, type }) => {
  const [terms, setTerms] = useState("");

  useEffect(() => {
    let content = "";

    switch (type) {
      case "terms-of-service":
        content = require("./terms-of-service.md");
        break;
      case "privacy-policy":
        content = require("./privacy-policy.md");
        break;
      case "code-review-license":
        content = require("./code-review-license.md");
        break;
    }

    setTerms(content);
  }, []);

  return (
    <SiteWrapper>
      <Container fluid="xl" className="mx-5">
        <div className="title">{title}</div>
        <hr />

        <div className="contents">
          <ReactMarkdown source={terms} />
        </div>
      </Container>
    </SiteWrapper>
  );
};

export default LegalPage;
