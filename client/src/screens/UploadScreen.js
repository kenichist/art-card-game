// --- START OF FILE UploadScreen.js ---

import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const UploadScreen = () => {
  const { t } = useTranslation(); // Get translation function
  const [itemFile, setItemFile] = useState(null);
  const [collectorFile, setCollectorFile] = useState(null);
  const [itemName, setItemName] = useState('');
  const [collectorName, setCollectorName] = useState('');
  const [itemDescriptions, setItemDescriptions] = useState([
    { attribute: '', value: 0 }
  ]);
  const [collectorDescriptions, setCollectorDescriptions] = useState([
    { attribute: '', value: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const addItemDescription = () => {
    setItemDescriptions([...itemDescriptions, { attribute: '', value: 0 }]);
  };

  const addCollectorDescription = () => {
    setCollectorDescriptions([...collectorDescriptions, { attribute: '', value: 0 }]);
  };

  const handleItemDescriptionChange = (index, field, value) => {
    const newDescriptions = [...itemDescriptions];
    newDescriptions[index][field] = field === 'value' ? Number(value) : value;
    setItemDescriptions(newDescriptions);
  };

  const handleCollectorDescriptionChange = (index, field, value) => {
    const newDescriptions = [...collectorDescriptions];
    newDescriptions[index][field] = field === 'value' ? Number(value) : value;
    setCollectorDescriptions(newDescriptions);
  };

  const handleItemUpload = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' }); // Clear previous message

    if (!itemFile || !itemName || itemDescriptions.some(desc => !desc.attribute || desc.value === undefined)) {
      setMessage({
        type: 'danger',
         // Use t() for error message
        text: t('uploadError', { type: t('item') }) // Pass 'item' type for context
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', itemFile);
    formData.append('name', itemName);

    try {
      setLoading(true);
      const { data: items } = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
      const nextId = items.length > 0 ? Math.max(...items.map(item => item.id || 0)) + 1 : 1;

      formData.append('id', nextId);
      formData.append('descriptions', JSON.stringify(itemDescriptions));

      await axios.post(`${process.env.REACT_APP_API_URL}/api/items`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({
        type: 'success',
        // Use t() for success message with interpolation
        text: t('uploadSuccess', { type: t('Item'), id: nextId })
      });

      // Reset form
      setItemFile(null);
      setItemName('');
      setItemDescriptions([{ attribute: '', value: 0 }]);
      // Clear file input visually (might need direct DOM manipulation or a key change on the input)
      const itemFileInput = document.getElementById('itemImage');
      if (itemFileInput) itemFileInput.value = null;


    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || error.message || t('error', { message: 'Upload failed' })
      });
    } finally {
       setLoading(false);
    }
  };

  const handleCollectorUpload = async (e) => {
     e.preventDefault();
     setMessage({ type: '', text: '' }); // Clear previous message

     if (!collectorFile || !collectorName || collectorDescriptions.some(desc => !desc.attribute || desc.value === undefined)) {
      setMessage({
        type: 'danger',
        // Use t() for error message
        text: t('uploadError', { type: t('collector') }) // Pass 'collector' type for context
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', collectorFile);
    formData.append('name', collectorName);

    try {
      setLoading(true);
      const { data: collectors } = await axios.get(`${process.env.REACT_APP_API_URL}/api/collectors`);
       const nextId = collectors.length > 0 ? Math.max(...collectors.map(c => c.id || 0)) + 1 : 1;


      formData.append('id', nextId);
      formData.append('descriptions', JSON.stringify(collectorDescriptions));

       // Corrected API endpoint path
      await axios.post(`${process.env.REACT_APP_API_URL}/api/collectors`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({
        type: 'success',
        // Use t() for success message with interpolation
        text: t('uploadSuccess', { type: t('Collector'), id: nextId })
      });

      // Reset form
      setCollectorFile(null);
      setCollectorName('');
      setCollectorDescriptions([{ attribute: '', value: 0 }]);
       // Clear file input visually
      const collectorFileInput = document.getElementById('collectorImage');
      if (collectorFileInput) collectorFileInput.value = null;

    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || error.message || t('error', { message: 'Upload failed' })
      });
    } finally {
       setLoading(false);
    }
  };


  return (
    <Container>
      {/* Use t() for title */}
      <h1 className="my-4">{t('uploadTitle')}</h1>

      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
          {message.text} {/* Message text is already translated */}
        </Alert>
      )}

      <Row>
        {/* Item Upload Form */}
        <Col md={6}>
          <Card className="mb-4">
             {/* Use t() for card header */}
            <Card.Header as="h4">{t('uploadItem')}</Card.Header>
            <Card.Body>
              <Form onSubmit={handleItemUpload}>
                <Form.Group controlId="itemName" className="mb-3">
                   {/* Use t() for labels */}
                  <Form.Label>{t('itemNameLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                     /* Use t() for placeholders */
                    placeholder={t('itemNamePlaceholder')}
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="itemImage" className="mb-3">
                  <Form.Label>{t('itemImageLabel')}</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setItemFile(e.target.files[0])}
                  />
                </Form.Group>

                 {/* Use t() for label */}
                <Form.Label>{t('descriptionsLabel')}</Form.Label>
                {itemDescriptions.map((desc, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={8}>
                      <Form.Control
                         /* Use t() for placeholders */
                        placeholder={t('descAttributePlaceholder')}
                        value={desc.attribute}
                        onChange={(e) => handleItemDescriptionChange(index, 'attribute', e.target.value)}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="number"
                        placeholder={t('descValuePlaceholder')}
                        value={desc.value}
                        onChange={(e) => handleItemDescriptionChange(index, 'value', e.target.value)}
                      />
                    </Col>
                  </Row>
                ))}

                <Button
                  variant="secondary"
                  onClick={addItemDescription}
                  className="mb-3"
                >
                  {/* Use t() for button text */}
                  {t('addDescription')}
                </Button>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                  >
                    {/* Use t() for button text and loading state */}
                    {loading ? t('uploading') : t('submitUploadItem')}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Collector Upload Form */}
        <Col md={6}>
          <Card className="mb-4">
            {/* Use t() for card header */}
            <Card.Header as="h4">{t('uploadCollector')}</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCollectorUpload}>
                <Form.Group controlId="collectorName" className="mb-3">
                  {/* Use t() for labels */}
                  <Form.Label>{t('collectorNameLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    /* Use t() for placeholders */
                    placeholder={t('collectorNamePlaceholder')}
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="collectorImage" className="mb-3">
                  <Form.Label>{t('collectorImageLabel')}</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setCollectorFile(e.target.files[0])}
                  />
                </Form.Group>

                {/* Use t() for label */}
                <Form.Label>{t('descriptionsLabel')}</Form.Label>
                {collectorDescriptions.map((desc, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={8}>
                      <Form.Control
                        /* Use t() for placeholders */
                        placeholder={t('descAttributePlaceholder')}
                        value={desc.attribute}
                        onChange={(e) => handleCollectorDescriptionChange(index, 'attribute', e.target.value)}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="number"
                        placeholder={t('descValuePlaceholder')}
                        value={desc.value}
                        onChange={(e) => handleCollectorDescriptionChange(index, 'value', e.target.value)}
                      />
                    </Col>
                  </Row>
                ))}

                <Button
                  variant="secondary"
                  onClick={addCollectorDescription}
                  className="mb-3"
                >
                  {/* Use t() for button text */}
                  {t('addDescription')}
                </Button>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                  >
                     {/* Use t() for button text and loading state */}
                    {loading ? t('uploading') : t('submitUploadCollector')}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UploadScreen;
// --- END OF FILE UploadScreen.js ---