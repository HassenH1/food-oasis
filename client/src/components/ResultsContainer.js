import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import { useOrganizations } from "../hooks/useOrganizations/useOrganizations";
import ResultsFilters from "./ResultsFilters";
import ResultsList from "./ResultsList";
import ResultsMap from "./ResultsMap";
import useCategoryIds from "../hooks/useCategoryIds";
import { FOOD_PANTRY_CATEGORY_ID, MEAL_PROGRAM_CATEGORY_ID } from "../constants/map";

const useStyles = makeStyles((theme) => ({
  filterButton: {
    margin: "0 .25rem",
    padding: "0 0.5rem",
    fontSize: "12px",
  },
  div: {
    textAlign: "center",
    fontSize: "12px",
    border: "1px solid blue",
  },
  container: {
    display: "flex",
    flexDirection: "column",
  },
  list: {
    textAlign: "center",
    fontSize: "12px",
    height: "46em",
    overflow: "scroll",
  },
  map: {
    textAlign: "center",
    fontSize: "12px",
    maxWidth: "100%",
    flexGrow: 1,
  },
}));



export default function ResultsContainer(props) {
  const { userCoordinates } = props;
  const { data, search } = useOrganizations();
  const classes = useStyles();

  /**
   * ***PLAN!***
   *
   * get the initial search params from the query string
   *
   * pass query string params down to ResultsFilters as props
   * pass function down to search filter to update qs-params??
   *     maybe this is already handled by useStakeholders?? should it be????
   *
   * pass stakeholders array down to map and list components
   *
   * hold 'selected stakeholder' in local state
   */

  const { categoryIds, toggleCategory } = useCategoryIds([])

  const [radius, setRadius] = React.useState(5);
  const [origin, setOrigin] = React.useState({ latitude: 0, longitude: 0 });
  const [isVerifiedSelected, selectVerified] = React.useState(false);
  const [selectedStakeholder, doSelectStakeholder] = React.useState(null);

  const topLevelProps = {
    radius,
    setRadius,
    origin,
    setOrigin,
    toggleCategory,
    categoryIds,
    isVerifiedSelected,
    selectVerified,
    userCoordinates,
  };

  return (
    <div className={classes.container}>
      <ResultsFilters
        {...topLevelProps}
        search={search}
        /**
         * distance: PropTypes.number,
         * placeName: PropTypes.string,
         * isPantryCategorySelected: PropTypes.bool,
         * isMealCategorySelected: PropTypes.bool,
         * isVerifiedFilterSelected: PropTypes.bool,
         */
      />
      <Grid container wrap="wrap-reverse">
        <Grid item xs={12} md={4} className={classes.list}>
          <ResultsList
            selectedStakeholder={selectedStakeholder}
            doSelectStakeholder={doSelectStakeholder}
            stakeholders={data}
          />
        </Grid>
        <Grid item xs={12} md={8} className={classes.map}>
          <ResultsMap
            // selectedStakeholder={selectedStakeholder}
            stakeholders={data}
            categoryIds={categoryIds}
            // selectedLatitude={selectedLatitude}
            // selectedLongitude={selectedLongitude}
            /**
             * selectedLatitude: PropTypes.number,
             * selectedLongitude: PropTypes.number,
             * selectedStakeholder: PropTypes.object,
             * stakeholders: PropTypes.arrayOf(PropTypes.object)
             */
          />
        </Grid>
      </Grid>
    </div>
  );
}
