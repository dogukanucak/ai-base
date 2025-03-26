import { Component } from 'solid-js';
import { Backoffice } from '../plugins/backoffice/components/Backoffice';
import { useBackofficeInit } from '../plugins/backoffice/hooks/useBackofficeInit';
import styles from './BackofficePage.module.scss';

const BackofficePage: Component = () => {
  useBackofficeInit();

  return (
    <div class={styles.page}>
      <Backoffice />
    </div>
  );
};

export default BackofficePage; 