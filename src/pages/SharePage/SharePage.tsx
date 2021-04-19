import React, { useState, useEffect, useMemo } from "react";
import SiteWrapper from "../../SiteWrapper";
import { Row, Col, Container, Media, Button, Carousel, CarouselItem } from "react-bootstrap";
import shareImg from "../../assets/share-download.svg";
import "./SharePage.scss";

const SharePage = ({ history }) => {
  return (
    <SiteWrapper history={history} page='share' >
      <Container fluid='xl share'>
        <Row>
          <Col md={6} className='center' >
            <Row >
              <div className='preview-area'>
                preview-area
              </div>
            </Row>
          </Col>
          <Col md={6} className="control-area">
            <Row className='align-items-center'>
              <Col className='text-center'>
                <img width='88' src={shareImg} />
                <h2>You have been invited to view a file!</h2>
                <div className='text-filename'>FileName.png</div>
                <div className='text-filesize'>fileSize KB</div>
                <div className='row mb-3'>
                  <div className='col-md-5' style={{ width: '50%' }}>
                    <button className='btn btn-pill btn-download'>
                      <span></span>
                        Download File
                    </button>
                  </div>
                  <div className='col-md-5' style={{ width: '50%' }}>
                    <button className='btn btn-pill btn-preview' >
                      <span></span>
                        Hide  Preview
                    </button>
                  </div>
                </div>
                <div className='text-comment' style={{ marginTop: '50px' }}>
                  Get 10GB file storage and file sharing for free
                </div>
                <div className='text-comment'>
                  Free to share ideas. Free to be protected. Free to be you.
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </SiteWrapper >
  )
}

export default SharePage;
