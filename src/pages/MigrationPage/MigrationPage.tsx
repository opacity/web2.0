import React, { useState } from "react";
import { Field, Formik, FormikHelpers } from "formik";
import { Form } from "tabler-react";
import { hexToBytes } from "../../../ts-client-library/packages/util/src/hex";
import { AccountMigrator } from "../../../ts-client-library/packages/account-management/src/accountMigrator";
import { MigratorEvents } from "../../../ts-client-library/packages/account-management/src/migrateEvents";
// import { Link } from 'react-router-dom'
import "./MigrationPage.scss";
import SiteWrapper from "../../SiteWrapper";
import { Row, Col, Container, Button, ProgressBar } from "react-bootstrap";
import classNames from "classnames";
import {
  STORAGE_NODE as storageNode,
  DEFAULT_STORAGE_NODE_V1,
} from "../../config";

type MigrationFormProps = {
  privateKey: string;
};

const MigrationPage = ({ history }) => {
  const [privateKey, setPrivateKey] = useState("");
  const [migrationStatus, setMigrationStatus] = useState("init");
  const [migrationDetails, setMigrationDetails] = useState("");
  const [errorStatus, setErrorStatus] = useState("");
  const [percent, setPercent] = useState(0);

  const handleUpgrade = (
    values: MigrationFormProps,
    { setErrors }: FormikHelpers<MigrationFormProps>
  ) => {
    if (!privateKey?.length) {
      setErrors({
        privateKey: "Account handle is required.",
      });
      return;
    }
    if (privateKey.length != 128) {
      setErrors({
        privateKey: "Account handle must be 128 characters long",
      });
      return;
    }
    runMigrator(hexToBytes(privateKey));
  };

  const runMigrator = async (accountHandle: Uint8Array) => {
    setMigrationStatus("migrating...");
    const migrator = new AccountMigrator(accountHandle, {
      storageNodeV1: `https://${DEFAULT_STORAGE_NODE_V1}:3000`,
      storageNodeV2: storageNode,
    });

    migrator.addEventListener(MigratorEvents.PERCENT, (s: any) => {
      console.log("Percent:", s.detail.percent);
      setPercent(s.detail.percent);
    });

    migrator.addEventListener(MigratorEvents.STATUS, (s: any) => {
      console.log("Status:", s.detail.status);
      setMigrationStatus(s.detail.status);
    });

    migrator.addEventListener(MigratorEvents.DETAILS, (d: any) => {
      console.info("Details:", d.detail.details);
      setMigrationDetails(d.detail.details);
    });

    migrator.addEventListener(MigratorEvents.WARNIsNG, (w: any) => {
      console.warn("Warning:", w.detail.warning);
      setErrorStatus(w.detail.warning);
    });

    migrator.addEventListener(MigratorEvents.ERROR, (w: any) => {
      console.warn("Error (this may result in data loss!):", w.detail.error);
      setErrorStatus(w.detail.error);
    });

    await migrator.migrate();
  };

  return (
    <SiteWrapper history={history} page="migration">
      <Container fluid="xl migration">
        <Formik
          initialValues={{ privateKey: "" }}
          onSubmit={(values, helpers) => {
            handleUpgrade(values, helpers);
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <form onSubmit={handleSubmit} autoComplete="off">
              <Row className="align-items-center ">
                <Col className="text-center">
                  <h2>Upgrade your account to Opacity V2.0</h2>
                  <p>
                    {migrationStatus === "init"
                      ? `If your account was created before 'release date', you must upgrade to the latest version. Please enter your account handle below to complete the upgrade`
                      : migrationStatus === "Finished."
                      ? `Your account has been migrated successfully.`
                      : `Please wait while we complete the upgrade. Do not leave this page or interrupt the process. This may take some time depending on the size of your account.`}
                  </p>
                </Col>
              </Row>
              {migrationStatus === "init" ? (
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <Field
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        name="privateKey"
                        placeholder="Account Handle"
                        className={
                          errors.privateKey && touched.privateKey
                            ? "form-control is-invalid state-invalid"
                            : "form-control"
                        }
                      />
                      {errors.privateKey && touched.privateKey && (
                        <div className="invalid-feedback">
                          {errors.privateKey}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md="12" className="mt-3">
                    <Button type="submit" variant="primary btn-pill" size="lg">
                      Upgrade Account
                    </Button>
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col md="12" className="text-center">
                    <div className="migrate-progress">
                      {(migrationStatus !== "Finished." ||
                        errorStatus !== "") && (
                        <div className="percentage-text">{percent}%</div>
                      )}
                      <ProgressBar now={percent} animated striped />
                      <div
                        className={classNames(
                          "migrate-status",
                          errorStatus !== "" && "migrate-status-error"
                        )}
                      >
                        {errorStatus !== "" ? errorStatus : migrationStatus}
                      </div>
                      <div className="migrate-details">{migrationDetails}</div>
                    </div>
                  </Col>
                </Row>
              )}
            </form>
          )}
        </Formik>
      </Container>
    </SiteWrapper>
  );
};

export default MigrationPage;
