import React, { useState, useEffect } from 'react';
import { Container, Form } from 'react-bootstrap';

import Pagination from '../../components/common/Pagination';
import SelectMenu from '../../components/common/SelectMenu';
import Loader from '../../components/common/Loader';

import { useAppContext } from '../../components/context/AppDataProvider';

const BusinessType = ({ page, previous, next }) => {
  const [types, setTypes] = useState(false);
  const [categories, setCategories] = useState(false);
  const { api, app, setAppData, handleError } = useAppContext();

  const getTypesAndCategories = async () => {
    console.log('Getting Business Types and Naics categories ...');
    try {
      const [typesResponse, categoriesResponse] = await Promise.all([
        api.getBusinessTypes(),
        api.getNacisCategories()
      ]);
      if (typesResponse.data.success) {
        setTypes(typesResponse.data.business_types.map(type => ({ value: type.name, label: type.label })));
        setAppData({
          responses: [{
            endpoint: '/get_business_types',
            result: JSON.stringify(typesResponse, null, '\t')
          }, ...app.responses]
        });
      }
      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.naics_categories);
        setAppData({
          responses: [{
            endpoint: '/get_naics_categories',
            result: JSON.stringify(categoriesResponse, null, '\t')
          }, ...app.responses]
        });
      }
    } catch (err) {
      console.log('  ... looks like we ran into an issue!');
      handleError(err);
    };
  };

  useEffect(() => {
    getTypesAndCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container fluid className={`main-content-container d-flex flex-column flex-grow-1 loaded ${page.replace('/', '')}`}>

      <h1 className="mb-1">Business Type and Category</h1>

      <p className="mb-1 text-lg text-muted">Please choose your business type and category. This will determine the information we need to collect from you moving forward.</p>

      <p className="text-muted mb-3">This page represents <a href="https://docs.silamoney.com/docs/get_business_types" target="_blank" rel="noopener noreferrer">/get_business_types</a> and <a href="https://docs.silamoney.com/docs/get_naics_categories" target="_blank" rel="noopener noreferrer">/get_naics_categories</a> functionality.</p>

      {(!types || !categories) && <Loader />}

      <div className="select-menu-height">
        {types && <>
        <Form.Label>Business Type:</Form.Label>
        <SelectMenu fullWidth
          title={app.settings.kybBusinessType ? types.find(type => type.value === app.settings.kybBusinessType).label : 'Please choose a business type...'}
          onChange={(value) => setAppData({ settings: { ...app.settings, kybBusinessType: value } })}
          className="types mb-3 select-menu-height"
          value={app.settings.kybBusinessType}
          options={types.map(type => ({ label: type.label, value: type.value }))} /></>}

        {categories && <>
        <Form.Label>NAICS Category:</Form.Label>
        <SelectMenu fullWidth
          title={app.settings.kybNaicsCategory ? Object.keys(categories)[app.settings.kybNaicsCategory] : 'Please choose a NAICS category...'}
          onChange={(value) => setAppData({ settings: { ...app.settings, kybNaicsCategory: value, kybNaicsCode: false } })}
          className="categories mb-3 select-menu-height"
          value={app.settings.kybNaicsCategory}
          options={Object.keys(categories).map((category, index) => ({ label: category, value: index }))} /></>}

        {(app.settings.kybNaicsCategory === 0 || app.settings.kybNaicsCategory) && categories && <>
        <Form.Label>NAICS Sub-Category:</Form.Label>
        <SelectMenu fullWidth
          title={app.settings.kybNaicsCode && Object.values(categories)[app.settings.kybNaicsCategory].find(category => app.settings.kybNaicsCode === category.code) ? Object.values(categories)[app.settings.kybNaicsCategory].find(category => app.settings.kybNaicsCode === category.code).subcategory : 'Please choose a NAICS subcategory...'}
          onChange={(value) => setAppData({ settings: { ...app.settings, kybNaicsCode: value } })}
          className="categories mb-3 select-menu-height"
          value={app.settings.kybNaicsCode}
          options={Object.values(categories)[app.settings.kybNaicsCategory].map(category => ({ label: category.subcategory, value: category.code }))} /></>}
        </div>

      <Pagination
        previous={previous}
        next={app.settings.kybBusinessType && app.settings.kybNaicsCode ? next : undefined}
        currentPage={page} />

    </Container>
  );
};

export default BusinessType;
