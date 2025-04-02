// --- START OF FILE src/screens/UploadScreen.js ---

import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const UploadScreen = () => {
  const { t } = useTranslation();
  const [itemFile, setItemFile] = useState(null); // For 2D image
  const [itemModelFile, setItemModelFile] = useState(null); // *** NEW: State for 3D model file ***
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

  // --- Handler functions (addItemDescription, addCollectorDescription, handleItemDescriptionChange, handleCollectorDescriptionChange) remain the same ---
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
  // --- End of unchanged handlers ---


  // --- Updated Item Upload Handler ---
  const handleItemUpload = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Basic validation (model file is optional)
    if (!itemFile || !itemName || itemDescriptions.some(desc => !desc.attribute || desc.value === undefined)) {
      setMessage({ type: 'danger', text: t('uploadError', { type: t('item') }) });
      return;
    }

    const formData = new FormData();
    formData.append('image', itemFile); // Append 2D image
    formData.append('name', itemName);
    // Note: ID calculation might be better handled server-side, but keeping client-side logic for now
    try {
        setLoading(true);
        const { data: items } = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
        const nextId = items.length > 0 ? Math.max(...items.map(item => item.id || 0)) + 1 : 1;
        formData.append('id', nextId);
    } catch(error) {
        console.error("Failed to fetch items for ID generation:", error);
        setMessage({ type: 'danger', text: "Error determining next ID. Cannot upload."});
        setLoading(false);
        return; // Stop upload if ID generation fails
    }

    formData.append('descriptions', JSON.stringify(itemDescriptions));

    // *** NEW: Conditionally append the 3D model file ***
    if (itemModelFile) {
      // Use a distinct key for the model file (e.g., 'model') - ensure backend expects this key
      formData.append('model', itemModelFile);
    }

    try {
      // Axios POST request remains the same endpoint
      // The backend needs to be updated to handle both 'image' and optionally 'model' files
      await axios.post(`${process.env.REACT_APP_API_URL}/api/items`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({
        type: 'success',
        text: t('uploadSuccess', { type: t('Item'), id: formData.get('id') }) // Use ID from formData
      });

      // --- Reset form including the new model file input ---
      setItemFile(null);
      setItemName('');
      setItemDescriptions([{ attribute: '', value: 0 }]);
      setItemModelFile(null); // *** NEW: Reset model file state ***

      // Clear file input elements visually
      const itemFileInput = document.getElementById('itemImage');
      if (itemFileInput) itemFileInput.value = null;
      const itemModelInput = document.getElementById('itemModelFile'); // *** NEW: Get model input element ***
      if (itemModelInput) itemModelInput.value = null; // *** NEW: Clear model input element ***

    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || error.message || t('error', { message: 'Upload failed' })
      });
    } finally {
       setLoading(false);
    }
  };

  // --- Collector Upload Handler (handleCollectorUpload) remains the same ---
  const handleCollectorUpload = async (e) => {
     e.preventDefault();
     setMessage({ type: '', text: '' }); // Clear previous message

     if (!collectorFile || !collectorName || collectorDescriptions.some(desc => !desc.attribute || desc.value === undefined)) {
      setMessage({
        type: 'danger',
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

      await axios.post(`${process.env.REACT_APP_API_URL}/api/collectors`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({
        type: 'success',
        text: t('uploadSuccess', { type: t('Collector'), id: nextId })
      });

      // Reset form
      setCollectorFile(null);
      setCollectorName('');
      setCollectorDescriptions([{ attribute: '', value: 0 }]);
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
  // --- End of unchanged Collector handler ---


  // --- Updated JSX Return ---
  return (
    <Container>
      <h1 className="my-4">{t('uploadTitle')}</h1>

      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Row>
        {/* Item Upload Form */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h4">{t('uploadItem')}</Card.Header>
            <Card.Body>
              <Form onSubmit={handleItemUpload}>
                {/* Item Name Input */}
                <Form.Group controlId="itemName" className="mb-3">
                  <Form.Label>{t('itemNameLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('itemNamePlaceholder')}
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required // Make name required
                  />
                </Form.Group>

                {/* Item Image (2D) Input */}
                <Form.Group controlId="itemImage" className="mb-3">
                  <Form.Label>{t('itemImageLabel')} (Required)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*" // Accept standard image types
                    onChange={(e) => setItemFile(e.target.files[0])}
                    required // Make image required
                  />
                </Form.Group>

                {/* *** NEW: Item Model (3D) Input *** */}
                <Form.Group controlId="itemModelFile" className="mb-3">
                  {/* Add translation key 'itemModelLabel' */}
                  <Form.Label>{t('itemModelLabel') || '3D Model (.glb, .gltf, optional)'}</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".glb,.gltf" // Hint for accepted file types
                    onChange={(e) => setItemModelFile(e.target.files[0])}
                    // NOT required
                  />
                </Form.Group>

                {/* Item Descriptions Input */}
                <Form.Label>{t('descriptionsLabel')}</Form.Label>
                {itemDescriptions.map((desc, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={8}>
                      <Form.Control
                        placeholder={t('descAttributePlaceholder')}
                        value={desc.attribute}
                        onChange={(e) => handleItemDescriptionChange(index, 'attribute', e.target.value)}
                        required // Make attribute required if description row exists
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="number"
                        placeholder={t('descValuePlaceholder')}
                        value={desc.value}
                        onChange={(e) => handleItemDescriptionChange(index, 'value', e.target.value)}
                        required // Make value required if description row exists
                        step="any" // Allow decimal values if needed
                      />
                    </Col>
                  </Row>
                ))}
                <Button variant="secondary" onClick={addItemDescription} className="mb-3 me-2">
                  {t('addDescription')}
                </Button>
                 {/* Optional: Add button to remove last description */}
                 {itemDescriptions.length > 1 && (
                    <Button variant="outline-danger" onClick={() => setItemDescriptions(itemDescriptions.slice(0, -1))} className="mb-3">
                         Remove Last
                    </Button>
                 )}


                {/* Submit Button */}
                <div className="d-grid mt-3">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? t('uploading') : t('submitUploadItem')}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Collector Upload Form (remains the same structure) */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h4">{t('uploadCollector')}</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCollectorUpload}>
                {/* Collector Name Input */}
                <Form.Group controlId="collectorName" className="mb-3">
                  <Form.Label>{t('collectorNameLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('collectorNamePlaceholder')}
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                     required
                  />
                </Form.Group>

                {/* Collector Image Input */}
                <Form.Group controlId="collectorImage" className="mb-3">
                  <Form.Label>{t('collectorImageLabel')} (Required)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCollectorFile(e.target.files[0])}
                    required
                  />
                </Form.Group>

                {/* Collector Descriptions Input */}
                <Form.Label>{t('descriptionsLabel')}</Form.Label>
                {collectorDescriptions.map((desc, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={8}>
                      <Form.Control
                        placeholder={t('descAttributePlaceholder')}
                        value={desc.attribute}
                        onChange={(e) => handleCollectorDescriptionChange(index, 'attribute', e.target.value)}
                        required
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="number"
                        placeholder={t('descValuePlaceholder')}
                        value={desc.value}
                        onChange={(e) => handleCollectorDescriptionChange(index, 'value', e.target.value)}
                        required
                        step="any"
                      />
                    </Col>
                  </Row>
                ))}
                 <Button variant="secondary" onClick={addCollectorDescription} className="mb-3 me-2">
                  {t('addDescription')}
                </Button>
                 {collectorDescriptions.length > 1 && (
                    <Button variant="outline-danger" onClick={() => setCollectorDescriptions(collectorDescriptions.slice(0, -1))} className="mb-3">
                         Remove Last
                    </Button>
                 )}

                {/* Submit Button */}
                <div className="d-grid mt-3">
                  <Button variant="primary" type="submit" disabled={loading}>
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