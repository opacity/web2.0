import React, { useState } from "react";
import { Field, Formik, FormikHelpers } from "formik";
import { Form } from "tabler-react";
import { hexToBytes } from "../../../ts-client-library/packages/util/src/hex";
import { AccountMigrator } from "../../../ts-client-library/packages/account-management/src/accountMigrator";
import { MigratorEvents } from "../../../ts-client-library/packages/account-management/src/migrateEvents";
import "./MigrationPage.scss";
import SiteWrapper from "../../SiteWrapper";
import { Row, Col, Container, Button, ProgressBar } from "react-bootstrap";
import classNames from "classnames";
import { STORAGE_NODE as storageNode } from "../../config";

type MigrationFormProps = {
  privateKey: string;
};

const MigrationPage = ({ history }) => {
  const [privateKey, setPrivateKey] = useState("");
  const [migrationStatus, setMigrationStatus] = useState("init");
  const [migrationDetails, setMigrationDetails] = useState("");
  const [errorStatus, setErrorStatus] = useState("");
  const [percent, setPercent] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleUpgrade = (values: MigrationFormProps, { setErrors }: FormikHelpers<MigrationFormProps>) => {
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
      storageNode: storageNode,
    });

    migrator.addEventListener(MigratorEvents.PERCENT, (s: any) => {
      setPercent(s.detail.percent);
    });

    migrator.addEventListener(MigratorEvents.STATUS, (s: any) => {
      setMigrationStatus(s.detail.status);
    });

    migrator.addEventListener(MigratorEvents.DETAILS, (d: any) => {
      setMigrationDetails(d.detail.details);
    });

    migrator.addEventListener(MigratorEvents.WARNING, (w: any) => {
      setErrorStatus(w.detail.warning);
    });

    migrator.addEventListener(MigratorEvents.ERROR, (w: any) => {
      console.warn("Error (this may result in data loss!):", w.detail.error);
      setErrorStatus(w.detail.error);
    });

    await migrator.migrate();
  };

  return (
    <SiteWrapper history={history} showLoginModal={showLoginModal}>
      <Container fluid="xl" className="migration">
        <Formik
          initialValues={{ privateKey: "" }}
          onSubmit={(values, helpers) => {
            handleUpgrade(values, helpers);
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
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
                        className={errors.privateKey && touched.privateKey ? "form-control is-invalid state-invalid" : "form-control"}
                      />
                      {errors.privateKey && touched.privateKey && <div className="invalid-feedback">{errors.privateKey}</div>}
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
                      {(migrationStatus !== "Finished." || errorStatus !== "") && <div className="percentage-text">{percent}%</div>}
                      <ProgressBar now={percent} animated={percent !== 100 || migrationStatus !== "Finished."} striped />
                      <div className={classNames("migrate-status", errorStatus !== "" && "migrate-status-error")}>
                        {errorStatus !== "" ? errorStatus : percent === 100 ? "Finished." : migrationStatus}
                      </div>
                      {(percent === 100 || migrationStatus === "Finished.") && (
                        <div className="migrate-details">
                          You may now{" "}
                          <span
                            style={{
                              color: "red",
                              cursor: "pointer",
                            }}
                            onClick={() => setShowLoginModal(true)}
                          >
                            login
                          </span>{" "}
                          to your account
                        </div>
                      )}
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
