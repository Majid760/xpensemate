import React from 'react';
import { CSSTransition } from 'react-transition-group';
import './PageTransition.css';
import { useTranslation } from 'react-i18next';

const PageTransition = ({ children }) => {
  const { t } = useTranslation();
  return (
    <CSSTransition
      in={true}
      appear={true}
      timeout={300}
      classNames="page"
      unmountOnExit
    >
      {children}
    </CSSTransition>
  );
};

export default PageTransition; 