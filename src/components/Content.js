import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain, faLink, faFileContract, faLock} from '@fortawesome/free-solid-svg-icons'; // Import specific icons
import contentData from "../utils/contentData";

class Content extends Component {
  render() {
    // Assuming contentData is already filtered for items with at least one valid key-value pair
    return (
      <div className="next-steps my-5">
        <h2 className="my-5 text-center">What can I do next?</h2>
        <Row className="d-flex justify-content-between">
          {contentData.length > 0 ? contentData.map((item, index) => (
            <Col key={index} md={5} className="mb-4">
              {item.link && (
                <h6 className="mb-3">
                  <a href={item.link}>
                    <FontAwesomeIcon icon={faLink} className="mr-2" />
                    {item.title} {/* Assume title is always present as per your design */}
                  </a>
                </h6>
              )}
                {item.lock && (
                <h6 className="mb-3">
                  <div href={item.lock}>
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    {item.title} {/* Assume title is always present as per your design */}
                  </div>
                </h6>
              )}
              {item.brain && (
                <div className="mb-5">
                  <div href={item.brain}>
                    <FontAwesomeIcon icon={faBrain} className="mr-2" />
                    {item.title} {/* Repeating title rendering here, assuming it's a core part of each item */}
                  </div>
                </div>
              )}

              {item.copyright && (
                 <div className="mb-5">
                 <div href={item.copyright}>
                   <FontAwesomeIcon icon={faFileContract} className="mr-2" />
                   {item.title} {/* Repeating title rendering here, assuming it's a core part of each item */}
                 </div>
               </div>
              )}
              {item.description && <p>{item.description}</p>}
            </Col>
          )) : <Col>No items to display</Col>}
        </Row>
      </div>
    );
  }
}

export default Content;
