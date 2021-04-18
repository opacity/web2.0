import * as React from "react";
import { NavLink } from "tabler-react";
import { Row, Col, Container, Media, Button, Carousel, CarouselItem } from "react-bootstrap";
import SiteWrapper from "../../SiteWrapper";
import "./PlansPage.scss";
import { PlanType, PLANS } from "../../config";

const PlansPage = ({ history }) => {
  const loggedIn = localStorage.getItem('key') ? true : false;
  const [showSignUpModal, setShowSignUpModal] = React.useState(false);
  const [plan, setPlan] = React.useState<PlanType>();
  const handleCloseSignUpModal = () => {
    setShowSignUpModal(false);
  };
  const handleShowSignUpModal = (plan?: PlanType) => {
    setShowSignUpModal(true);
    setPlan(plan);
  };
  const [plans, setPlans] = React.useState<PlanType[]>([]);

  React.useEffect(() => {
    const filteredPlan = PLANS.filter((p) => !p.isCustom && (loggedIn ? p.specialPricing !== 'Free' : !p.isCustom))
    setPlans(filteredPlan)
  }, []);
  
  return (
    <SiteWrapper showSignUpModal={showSignUpModal} handleCloseSignUpModal={handleCloseSignUpModal} history={history} plan={plan}>
      <Container fluid='xl plans'>
        <Row>
          <h1>Choose your Opacity plan</h1>
        </Row>
        <div className='plans-wrapper'>
          <Carousel interval={null}>
            {plans.map((item, key) => (
              <CarouselItem key={key}>
                <div className={item.permalink}>
                  <div className='plans-item'>
                    <div>
                      <h2>{item.title}</h2>
                      <p>{item.content}</p>
                      <h2 className='mt-4'> {item.storageLimit}</h2>
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
                          <h2>{item.opctCost.toLocaleString()} OPCT</h2>
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
            ))}
          </Carousel>
        </div>
      </Container>
    </SiteWrapper>
  );
};

export default PlansPage;
