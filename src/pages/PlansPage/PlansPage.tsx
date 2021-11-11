import * as React from "react";
import { NavLink } from "tabler-react";
import { Row, Container, Button, Carousel, CarouselItem } from "react-bootstrap";
import SiteWrapper from "../../SiteWrapper";
import { PlanType, PLANS, STORAGE_NODE as storageNode } from "../../config";
import { Account } from "../../../ts-client-library/packages/account-management";
import { WebAccountMiddleware, WebNetworkMiddleware } from "../../../ts-client-library/packages/middleware-web";
import { hexToBytes } from "../../../ts-client-library/packages/util/src/hex";
import ReactLoading from "react-loading";
import "./PlansPage.scss";

const PlansPage = ({ history }) => {
  const loggedIn = localStorage.getItem("key") ? true : false;
  const [showSignUpModal, setShowSignUpModal] = React.useState(false);
  const [plan, setPlan] = React.useState<PlanType>();
  const [pageLoading, setPageLoading] = React.useState(true);
  const [plans, setPlans] = React.useState<PlanType[]>([]);
  const [availableFrom, setAvailableFrom] = React.useState(0);

  const cryptoMiddleware = React.useMemo(
    () =>
      loggedIn
        ? new WebAccountMiddleware({
            asymmetricKey: hexToBytes(localStorage.getItem("key")),
          })
        : new WebAccountMiddleware(),
    []
  );
  const netMiddleware = React.useMemo(() => new WebNetworkMiddleware(), []);
  const account = React.useMemo(
    () =>
      new Account({
        crypto: cryptoMiddleware,
        net: netMiddleware,
        storageNode,
      }),
    [cryptoMiddleware, netMiddleware, storageNode]
  );

  const getActionName = (type) => {
    switch (type) {
      case "free":
        return "Try It";

      case "basic":
      case "professional":
      case "business":
        return "Buy It";

      default:
        return "Contact Us";
    }
  };

  const handleCloseSignUpModal = () => {
    setShowSignUpModal(false);
  };
  const handleShowSignUpModal = (plan?: PlanType) => {
    setShowSignUpModal(true);
    setPlan(plan);
  };


  React.useEffect(() => {
    const init = async () => {
      try {
        setPageLoading(true);

        const plansApi = await account.plans();

        if (loggedIn) {
          const accountInfo = await account.info();
          const storageLimit = accountInfo.account.storageLimit;

          plansApi.forEach((plan, idx) => plan.storageInGB === storageLimit && setAvailableFrom(idx + 1));
        } else {
          setAvailableFrom(0);
        }
        const converedPlan = PLANS.map((item, index) => {
          if (plansApi[index]) {
            const { cost, costInUSD, storageInGB, name } = plansApi[index];
            return {
              ...item,
              opctCost: cost,
              usdCost: costInUSD,
              storageInGB,
              name,
            };
          } else {
            return item;
          }
        });
        setPlans(converedPlan);
        setPageLoading(false);
      } catch {
        // setPageLoading(false)
      }
    };
    account && init();
  }, [account]);

  return (
    <SiteWrapper showSignUpModal={showSignUpModal} handleCloseSignUpModal={handleCloseSignUpModal} history={history} plan={plan}>
      {pageLoading && (
        <div className="loading">
          <ReactLoading type="spinningBubbles" color="#2e6dde" />
        </div>
      )}
      <Container fluid="xl" className="plans">
        <Row>
          <h1>Choose the best plan for you</h1>
        </Row>
        <div className="plans-wrapper">
          <Carousel interval={null}>
            {plans.map((item, key) => {
              return (
                key >= availableFrom && (
                  <CarouselItem key={key}>
                    <div className={item.permalink + " plans-item-wrapper"}>
                      <div className="plans-item">
                        <div>
                          <h2 className="text-center">{item.title}</h2>
                          {/* Start Pricing */}
                          <div className="pricing-wrapper">
                            <div>
                              {item.permalink === "free" && (
                                <div className="price">
                                  <h2>Free</h2>
                                </div>
                              )}
                              {item.opctCost > 0 && (
                                <div className="price">
                                  <h2>{item.opctCost} OPCT</h2>
                                  <p>per year</p>
                                </div>
                              )}
                              {item.usdCost > 0 && (
                                <React.Fragment>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: "&ndash; or &ndash;",
                                    }}
                                    className="text-center"
                                  />
                                  {item.discountedUsdCost ? (
                                    <>
                                      <div className="price discount">
                                        <h2>${item.usdCost}</h2>
                                      </div>
                                      <div className="price">
                                        <h2>${item.discountedUsdCost}**</h2>
                                        <p>per year</p>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="price">
                                      <h2>${item.usdCost}</h2>
                                      <p>per year</p>
                                    </div>
                                  )}
                                </React.Fragment>
                              )}
                              {item.usdCost === 0 && item.opctCost === 0 && item.permalink !== "free" && (
                                <>
                                  <React.Fragment>
                                    <div>
                                      <div className="price">
                                        <h2>{item.specialPricing}</h2>
                                      </div>
                                    </div>
                                  </React.Fragment>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Start Buy Button */}
                          {item.isAvailable ? (
                            <div className="button-wrapper">
                              <Button
                                onClick={() => {
                                  handleShowSignUpModal(item);
                                }}
                              >
                                {item.isAvailable ? getActionName(item.permalink) : "Contact Us"}
                              </Button>
                            </div>
                          ) : (
                            <div className="button-wrapper">
                              <NavLink className="btn btn-primary" href="mailto:sales@opacity.io">
                                Contact Us
                              </NavLink>
                            </div>
                          )}

                          {/* End Buy Button */}

                          {/* <div className="border-bottom mb-4 mt-4"></div> */}
                          {/* End Pricing */}

                          <p className="content">{item.content}</p>

                          <div className="border-bottom mb-4 mt-1"></div>

                          <h2 className="mt-4 text-center">
                            {item.storageInGB >= 1024 ? `${item.storageInGB / 1024} TB` : `${item.storageInGB} GB`}
                          </h2>

                          <div className="features-wrapper">
                            {item.features.map((feature, key) => (
                              <p className="features" key={key}>
                                {feature}
                              </p>
                            ))}
                          </div>

                          <div className="includes">
                            {item.includesDesktopApp && <p>* With Desktop App</p>}
                            {item.discountedUsdCost && <p>** Limited Time Discount</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                )
              );
            })}
          </Carousel>
        </div>
      </Container>
    </SiteWrapper>
  );
};

export default PlansPage;
