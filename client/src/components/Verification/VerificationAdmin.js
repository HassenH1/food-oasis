import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Button, CssBaseline, Dialog, Typography } from "@material-ui/core";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import { SearchButton } from "../Buttons";
import StakeholderGrid from "../StakeholderGrid";
import { RotateLoader } from "react-spinners";
import { useOrganizations } from "../../hooks/useOrganizations/useOrganizations";
import { useCategories } from "../../hooks/useCategories/useCategories";
import { assign } from "../../services/stakeholder-service";
import AssignDialog from "./AssignDialog";
import SearchCriteria from "./SearchCriteria";

const CRITERIA_TOKEN = "verificationAdminCriteria";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    flexBasis: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "2rem",
    paddingBottom: "0",
  },
  mainContent: {
    flexGrow: 1,
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    // color: theme.palette.grey[500],
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: "none",
  },
  bigMessage: {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#E8E8E8",
    textAlign: "center",
    padding: "4em",
  },
}));

const DialogTitle = (props) => {
  const classes = useStyles();
  const { children, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <SearchButton
          aria-label="close"
          onClick={onClose}
          className={classes.closeButton}
        />
      ) : null}
    </MuiDialogTitle>
  );
};

const defaultCriteria = {
  name: "",
  latitude: 34,
  longitude: -118,
  placeName: "",
  radius: 0,
  categoryIds: [],
  isInactive: "either",
  isAssigned: "either",
  isVerified: "either",
  isApproved: "either",
  isRejected: "either",
  isClaimed: "either",
  assignedLoginId: null,
  claimedLoginId: null,
};

function VerificationAdmin(props) {
  const { userCoordinates } = props;
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [criteria, setCriteria] = useState(defaultCriteria);
  const [selectedStakeholderIds, setSelectedStakeholderIds] = useState([]);

  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    data: stakeholders,
    loading: stakeholdersLoading,
    error: stakeholdersError,
    search: stakeholderSearch,
  } = useOrganizations();

  useEffect(() => {
    if (!stakeholderSearch) return;
    const criteriaString = localStorage.getItem(CRITERIA_TOKEN);
    let initialCriteria = JSON.parse(criteriaString);
    if (!initialCriteria) {
      initialCriteria = {
        ...defaultCriteria,
        latitude: userCoordinates.latitude,
        longitude: userCoordinates.longitude,
      };
    }
    setCriteria(initialCriteria);
    stakeholderSearch(initialCriteria);
  }, [userCoordinates]);

  const search = async () => {
    await stakeholderSearch(criteria);
    localStorage.setItem(CRITERIA_TOKEN, JSON.stringify(criteria));
  };

  const handleAssignDialogOpen = async () => {
    setAssignDialogOpen(true);
    console.log(selectedStakeholderIds);
  };

  const handleAssignDialogClose = async (loginId) => {
    setAssignDialogOpen(false);
    // Dialog returns false if cancelled, null if
    // want to unassign, otherwisd a loginId > 0
    if (loginId === false) return;
    for (let i = 0; i < selectedStakeholderIds.length; i++) {
      await assign(selectedStakeholderIds[i], !!loginId, loginId);
    }
    search();
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    search();
    setDialogOpen(false);
  };

  return (
    <main className={classes.root}>
      <CssBaseline />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          margin: "10px",
        }}
      >
        <header className={classes.header}>
          <Typography
            variant="h4"
            component="h4"
            align="center"
            style={{ marginBottom: "0.5em" }}
          >
            Verification Administration
          </Typography>
          <SearchButton onClick={handleDialogOpen} label="Criteria..." />
        </header>
      </div>
      <div className={classes.mainContent}>
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          fullWidth={true}
          maxWidth="lg"
        >
          <DialogTitle onClose={handleDialogClose}>Search Criteria</DialogTitle>

          {criteria ? (
            <div style={{ overflowY: "scroll" }}>
              <SearchCriteria
                key={JSON.stringify({
                  userLatitude: userCoordinates.latitude,
                  categories,
                })}
                userLatitude={userCoordinates.latitude}
                userLongitude={userCoordinates.longitude}
                categories={categories && categories.filter((c) => !c.inactive)}
                criteria={criteria}
                setCriteria={setCriteria}
                search={() => {
                  search();
                  setDialogOpen(false);
                }}
              />
              {/* <pre>{JSON.stringify(criteria, null, 2)}</pre> */}
            </div>
          ) : null}
          {categoriesError || stakeholdersError ? (
            <div> Uh Oh! Something went wrong!</div>
          ) : categoriesLoading || stakeholdersLoading ? (
            <div
              style={{
                height: "200",
                width: "100%",
                margin: "100px auto",
                display: "flex",
                justifyContent: "space-around",
              }}
              aria-label="Loading spinner"
            >
              <RotateLoader
                // css={}
                sizeUnit={"px"}
                size={15}
                color={"#FAEBD7"}
                loading={true}
              />
            </div>
          ) : null}
        </Dialog>
        <AssignDialog
          id="assign-dialog"
          keepMounted
          open={assignDialogOpen}
          onClose={handleAssignDialogClose}
        ></AssignDialog>
        <>
          {categoriesError || stakeholdersError ? (
            <div className={classes.bigMessage}>
              <Typography variant="h5" component="h5" style={{ color: "red" }}>
                Uh Oh! Something went wrong!
              </Typography>
            </div>
          ) : categoriesLoading || stakeholdersLoading ? (
            <div
              style={{
                flexGrow: 1,
                width: "100%",
                margin: "100px auto",
                display: "flex",
                justifyContent: "space-around",
              }}
              aria-label="Loading spinner"
            >
              <RotateLoader
                // css={}
                sizeUnit={"px"}
                size={15}
                color={"green"}
                loading={true}
              />
            </div>
          ) : stakeholders && stakeholders.length === 0 ? (
            <div className={classes.bigMessage}>
              <Typography variant="h5" component="h5">
                No matches found, please try different criteria
              </Typography>
            </div>
          ) : stakeholders ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <Button
                  variant="contained"
                  title="Assign selected Organizations to User for Verification"
                  color="primary"
                  disabled={selectedStakeholderIds.length === 0}
                  onClick={handleAssignDialogOpen}
                >
                  Assign
                </Button>
                <div>{`${stakeholders.length} rows`} </div>
              </div>
              <StakeholderGrid
                stakeholders={stakeholders}
                setSelectedStakeholderIds={setSelectedStakeholderIds}
              />
            </>
          ) : (
            <div className={classes.bigMessage}>
              <Typography variant="h5" component="h5">
                Please enter search criteria and execute a search
              </Typography>
            </div>
          )}
          {/* <pre>{JSON.stringify(criteria, null, 2)}</pre> */}
        </>
      </div>
    </main>
  );
}

export default withRouter(VerificationAdmin);
