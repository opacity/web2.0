import * as React from "react";
import { NavLink } from "tabler-react";
import { Row, Col, Container, Media, Button, Carousel, CarouselItem } from "react-bootstrap";
import SiteWrapper from "../../SiteWrapper";
import "./PlansPage.scss";
import { PlanType, PLANS, STORAGE_NODE as storageNode } from "../../config";
import { Account } from "../../../ts-client-library/packages/account-management";
import {
  WebAccountMiddleware,
  WebNetworkMiddleware,
} from "../../../ts-client-library/packages/middleware-web";
import ReactLoading from "react-loading";

const PlansPage = ({ history }) => {
  const loggedIn = localStorage.getItem('key') ? true : false;
  const [showSignUpModal, setShowSignUpModal] = React.useState(false);
  const [plan, setPlan] = React.useState<PlanType>();
  const [pageLoading, setPageLoading] = React.useState(true);
  const [plans, setPlans] = React.useState<PlanType[]>([]);

  const cryptoMiddleware = React.useMemo(() => new WebAccountMiddleware(), []);
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

  const handleCloseSignUpModal = () => {
    setShowSignUpModal(false);
  };
  const handleShowSignUpModal = (plan?: PlanType) => {
    setShowSignUpModal(true);
    setPlan(plan);
  };

  React.useEffect(() => {
    // const filteredPlan = PLANS.filter((p) => !p.isCustom && (loggedIn ? p.specialPricing !== 'Free' : !p.isCustom))

    // setPlans(PLANS)
  }, []);

  React.useEffect(() => {
    const init = async () => {
      try {
        setPageLoading(true)
        const plansApi = await account.plans()
        const converedPlan = PLANS.map((item, index) => {
          if (plansApi[index]) {
            const { cost, costInUSD, storageInGB } = plansApi[index]
            return {
              ...item,
              opctCost: cost,
              usdCost: costInUSD,
              storageInGB,
            }
          } else {
            return item
          }
        })
        setPlans(converedPlan)
        setPageLoading(false)
      } catch {
        // setPageLoading(false)
      }
    }
    account && init()
  }, [account]);

  return (
    <SiteWrapper showSignUpModal={showSignUpModal} handleCloseSignUpModal={handleCloseSignUpModal} history={history} plan={plan}>
      {pageLoading && (
        <div className="loading">
          <ReactLoading type="spinningBubbles" color="#2e6dde" />
        </div>
      )}
      <Container fluid='xl plans'>
        <Row>
          <h1>Choose your Opacity plan</h1>
        </Row>
        <div className='plans-wrapper'>
          <Carousel interval={null}>
            {plans.map((item, key) => {
              return (
                <CarouselItem key={key}>
                  <div className={item.permalink}>
                    <div className='plans-item'>
                      <div>
                        <h2>{item.title}</h2>
                        <p>{item.content}</p>
                        <h2 className='mt-4'>{item.storageInGB >= 1024 ? `${item.storageInGB / 1024} TB` : `${item.storageInGB} GB`}</h2>
                        <div className='border-bottom mb-4 mt-1'></div>
                        <div className='features-wrapper'>
                          {item.features.map((feature, key) => (
                            <p className='features' key={key}>
                              {feature}
                            </p>
                          ))}
                        </div>

                        <div className='border-bottom mb-4 mt-4' hidden={item.permalink === "free"}></div>
                        {item.opctCost > 0 && (
                          <div className='price'>
                            <h2>{item.opctCost} OPCT</h2>
                            <p>per year</p>
                          </div>
                        )}
                        {item.usdCost > 0 && (
                          <React.Fragment>
                            <div dangerouslySetInnerHTML={{ __html: "&ndash; or &ndash;" }} />
                            {item.discountedUsdCost ? (
                              <>
                                <div className='price discount'>
                                  <h2>${item.usdCost}</h2>
                                </div>
                                <div className='price'>
                                  <h2>${item.discountedUsdCost}**</h2>
                                  <p>per year</p>
                                </div>
                              </>
                            ) : (
                              <div className='price'>
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
                                <div className='price'>
                                  <h2>{item.specialPricing}</h2>
                                </div>
                              </div>
                            </React.Fragment>
                          </>
                        )}
                        <div className='border-bottom mb-4 mt-4' hidden={item.permalink === "free" || item.permalink === "enterprise"}></div>
                        <div className='includes'>
                          {item.includesDesktopApp && <p>* With Desktop App</p>}
                          {item.discountedUsdCost && <p>** Limited Time Discount</p>}
                        </div>
                      </div>

                      {item.isAvailable ? (
                        <div className='button-wrapper'>
                          <Button
                            onClick={() => {
                              handleShowSignUpModal(item);
                            }}
                          >
                            {item.isAvailable ? "Choose plan" : "Contact Us"}
                          </Button>
                        </div>
                      ) : (
                        <div className='button-wrapper'>
                          <NavLink className='btn btn-primary' href='mailto:sales@opacity.io'>
                            Contact Us
                        </NavLink>
                        </div>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              )
            })}
          </Carousel>
        </div>
      </Container>
    </SiteWrapper>
  );
};

export default PlansPage;
