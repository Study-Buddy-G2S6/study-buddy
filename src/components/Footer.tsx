import { Col, Container } from 'react-bootstrap';

/** The Footer appears at the bottom of every page. Rendered by the App Layout component. */
const Footer = () => (
  <footer className="mt-auto py-3 bg-light">
    <Container>
      <Col className="text-center">
        © University of Hawai&apos;i at Manoa — Study Buddy
      </Col>
    </Container>
  </footer>
);

export default Footer;
