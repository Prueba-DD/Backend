import React from 'react';
import './FormSection.css';

/**
 * FormSection Component
 * 
 * Encapsulates form sections with visual support for danger zones.
 * 
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.children - Section content
 * @param {string} [props.icon] - Optional icon (emoji or icon class)
 * @param {boolean} [props.danger=false] - If true, applies red styling for danger zones
 */
function FormSection({ title, children, icon, danger = false }) {
  return (
    <section className={`form-section ${danger ? 'form-section--danger' : ''}`}>
      <div className="form-section__header">
        {icon && <span className="form-section__icon">{icon}</span>}
        <h2 className="form-section__title">{title}</h2>
      </div>
      <div className="form-section__content">
        {children}
      </div>
    </section>
  );
}

export default FormSection;
