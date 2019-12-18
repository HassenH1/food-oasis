import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import foodSeekers from '../images/food-seekers.svg';
import advocates from '../images/advocates.svg';
import volunteers from '../images/volunteers.svg';

const About = () => {
  const { t } = useTranslation('about');
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h2" gutterBottom>
        {t('title')}
      </Typography>

      <h1>{t('title')}</h1>
      <p>{t('p1')}</p>
      <p>{t('p2')}</p>
      <h2>{t('support')}</h2>
      <p>{t('support-p')}</p>
      <Button variant="contained" color="primary">
        {t('donate')}
      </Button>
      <h2>{t('use')}</h2>

      <Grid container justify="space-between" spacing={4}>
        <Grid
          container
          item
          md={4}
          xs={12}
          direction="column"
          justify="center"
          alignItems="center"
        >
          <img src={foodSeekers} alt="Hand holding an apple" />
          <h2>{t('stakeholder-1')}</h2>
          <p>
            <strong>{t('stakeholder-1ps')}</strong>
          </p>
          <p>{t('stakeholder-1p')}</p>
        </Grid>
        <Grid
          container
          item
          md={4}
          xs={12}
          direction="column"
          justify="center"
          alignItems="center"
        >
          <img src={advocates} alt="A community person" />
          <h2>{t('stakeholder-2')}</h2>
          <p>
            <strong>{t('stakeholder-2ps')}</strong>
          </p>
          <p>{t('stakeholder-2p')}</p>
        </Grid>
        <Grid
          container
          item
          md={4}
          xs={12}
          direction="column"
          justify="center"
          alignItems="center"
        >
          <img src={volunteers} alt="Raised hand" />
          <h2>{t('stakeholder-3')}</h2>
          <p>
            <strong>{t('stakeholder-3ps')}</strong>
          </p>
          <p>{t('stakeholder-3p')}</p>
        </Grid>
      </Grid>

      <h2>{t('mission')}</h2>
      <p>{t('mission-p')}</p>
      <h2>{t('team')}</h2>
      <p>{t('team-p')}</p>
      <h2>{t('about-hack')}</h2>
      <p>{t('about-hack-p')}</p>
    </Container>
  );
};

export default About;
