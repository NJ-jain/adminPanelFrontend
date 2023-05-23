import React, { useState, useEffect } from "react";
import {Box,Button,Tabs,IconButton,Menu,MenuItem,CircularProgress,} from "@mui/material";
import PopupModal from "../popupModal";
import FilterModal from "../filterPopUp";
import PropTypes from "prop-types";
import SingleTable from "./singleTable";
import { useNavigate, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { bulkAddColumns } from "../../store/table/tableThunk";
import { useDispatch, useSelector } from "react-redux";
import MainTable from "../../table/mainTable";
import { createTable1 } from "../../store/allTable/allTableThunk";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { deleteFilter } from "../../api/filterApi";
import { setTableLoading } from "../../store/table/tableSlice";
import { setAllTablesData } from "../../store/allTable/allTableSlice";
import { createTable } from "../../api/tableApi";
// import HideFieldDropdown from "./hidefieldDropdown";

export default function TablesList({ dbData }) {
  const isTableLoading = useSelector((state) => state.table?.isTableLoading);
  // const columns=useSelector((state)=>state.table?.columns.map(columns=> (columns.label)));
  const dispatch = useDispatch();
  const params = useParams();
  const AllTableInfo = useSelector((state) => state.tables.tables);
  const [value, setValue] = useState(0);
  const navigate = useNavigate();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const [page, setPage] = useState(1);
  const [table, setTable] = useState();
  const [tabIndex, setTabIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [openn, setOpenn] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleOpenn = () => setOpenn(true);
  const [edit, setEdit] = useState(false);
  const [filterId, setFilterId] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const tableLength = Object.keys(AllTableInfo).length;
  const [underLine, setUnderLine] = useState(null)
  const [currentTable, setcurrentTable] = useState(null)

  // const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);

  // const handleMenuOpen = (event) => {
  //   setMenuAnchorEl(event.currentTarget);
  // };

  

  const handleClick = (event, id) => {
    setcurrentTable(id)
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const saveTable = async () => {
    const data = {
      tableName: table,
    };
    
    setOpen(false);
    const apiCreate = await createTable(dbData?.db?._id, data);
    
    
    dispatch(createTable1({ tables: apiCreate.data.data.tables }));

    const matchedKey = Object.keys(apiCreate?.data?.data?.tables).find(key => {
      return apiCreate?.data?.data?.tables[key].tableName === table;
    });

    if (matchedKey) {
      navigate(`/db/${dbData?.db?._id}/table/${matchedKey}`);
    }

    const newTableIndex = Object.keys(AllTableInfo).length;
    setValue(newTableIndex);
  };


  const handleEdit = async () => {
    setEdit(true);
    setOpenn(true);
  };

  function onFilterClicked(filter, id) {
    setUnderLine(id)
    setFilterId(id);
    setPage(1);
    dispatch(
      bulkAddColumns({
        dbId: dbData?.db?._id,
        tableName: params?.tableName || Object.keys(dbData?.db?.tables)[0],
        filter: filter,
        org_id: dbData?.db?.org_id,
        pageNo: 1,
        filterId: id
      })
    );
    navigate(`/db/${dbData?.db?._id}/table/${params?.tableName}/filter/${id}`);
  }
  const deleteFilterInDb = async (filterId) => {
    const data = {
      filterId: filterId,
    };
    const deletedFilter = await deleteFilter(
      dbData?.db?._id,
      params?.tableName,
      data
    );
    dispatch(
      setAllTablesData({
        dbId: dbData?.db?._id,
        tables: deletedFilter.data.data.tables,
      })
    );
    dispatch(
      bulkAddColumns({
        dbId: dbData?.db?._id,
        tableName: params?.tableName,
        org_id: dbData?.db?.org_id,
        pageNo: 1,
      })
    );
    navigate(`/db/${dbData?.db?._id}/table/${params?.tableName}`);
  };
  useEffect(() => {
    console.log(dbData);
 
    if (params?.filterName) {
      setUnderLine(params?.filterName)
      dispatch(
        bulkAddColumns({
          dbId: dbData?.db?._id,
          tableName: params?.tableName || Object.keys(dbData?.db?.tables)[0],
          filter: AllTableInfo[params?.tableName]?.filters[params?.filterName]?.query,
          org_id: dbData?.db?.org_id,
          pageNo: 1,
          filterId: params?.filterName
         
        })
        
      );
    }
    else if (dbData?.db?.tables) {
      const tableNames = Object.keys(dbData.db.tables);
      dispatch(setTableLoading(true));
      dispatch(
        bulkAddColumns({
          dbId: dbData?.db?._id,
          tableName: params?.tableName || tableNames[0],
          pageNo: 1,
        })
      );
      setValue(
        tableNames?.indexOf(params?.tableName) !== -1
          ? tableNames?.indexOf(params?.tableName)
          : 0
      );
      if (!params?.tableName) {
        navigate(`/db/${dbData?.db?._id}/table/${tableNames[0]}`);
      }

    }
  }, [params?.tableName]);
  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          height: "7vh",
          overflow: "hidden",
          position: "sticky",
          marginTop: "0.5vh"
        }}
      >
        <Box
          sx={{
            display: "flex",
            overflow: "hidden",
            width: "100%",
            height: "auto",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
          >
            {AllTableInfo &&
              Object.entries(AllTableInfo).map((table, index) => (
                <Box key={index} sx={{ height: "57px" }}>
                  <SingleTable
                    table={table}
                    tableLength={tableLength}
                    tabIndex={tabIndex}
                    setTabIndex={setTabIndex}
                    index={index}
                    dbData={dbData}
                    highlightActiveTable={() => setValue(index)}
                    value={value}
                    setPage={setPage}
                    setValue={setValue}
                  />
                </Box>
              ))}
          </Tabs>
          <Button
            variant="outlined"
            onClick={() => handleOpen()}
            sx={{ margin: "0.5rem", width: "fit-content", height: "5vh" }}
          >
            <AddIcon />
          </Button>
        </Box>
      </Box>
      <Box display="flex" flexWrap="nowrap">
        {AllTableInfo[params?.tableName]?.filters &&
          Object.entries(AllTableInfo[params?.tableName]?.filters).map(
            (filter, index) => (
              <Box key={index} sx={{ mt: "1%", ml: 1 }}>
                <Box
                  sx={{
                    backgroundColor: "#4B4E5A",
                    height: 30,
                    width: 120,
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    borderRadius: 3,
                    p: 1,
                  }}
                  onClick={() => {
                    onFilterClicked(filter[1].query, filter[0], filter[1]);
                  }}
                  style={{ textDecoration: underLine === filter[0] ? 'underline' : 'none' }}
                  variant="contained"
                  color="primary"
                >
                  {filter[1]?.filterName}
                  <IconButton onClick={(e) => handleClick(e, filter[0])}>
                    <MoreVertIcon sx={{ color: "#fff" }} />
                  </IconButton>

                </Box>
              </Box>
            )
          )}

        <Button
          onClick={() => handleOpenn()}
          variant="contained"
          sx={{ width: 100, mt: 1.5, ml: 1, fontSize: "11px" }}
        >
          Add Filter
        </Button>
      </Box>
      {/* <Button onClick={handleMenuOpen}>Hide Fields</Button>
      <HideFieldDropdown columns={columns} menuAnchorEl={menuAnchorEl} setMenuAnchorEl={setMenuAnchorEl} /> */}
      {open && (
        <PopupModal
          title="Create Table"
          label="Table Name"
          open={open}
          setOpen={setOpen}
          submitData={saveTable}
          setVariable={setTable}
          joiMessage={"Table name"}
        />
      )}
      {openn && (
        <FilterModal
          dbData={dbData}
          open={openn}
          edit={edit}
          setEdit={setEdit}
          setOpen={setOpenn}
          filterId={filterId}
          dbId={dbData?.db?._id}
          tableName={params?.tableName}
          setUnderLine={setUnderLine}
        />
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleClose()}
      >
        <MenuItem
          onClick={() => {
            handleEdit();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            deleteFilterInDb(currentTable);
            handleClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
      {isTableLoading ? (
        <CircularProgress />
      ) : (
        <>
          <MainTable setPage={setPage} page={page} />
        </>
      )}
    </>
  );
}
TablesList.propTypes = {
  dbData: PropTypes.any,
  table: PropTypes.string,
  dbId: PropTypes.string,
  orgId: PropTypes.string,
  tables: PropTypes.any,
  dropdown: PropTypes.any,
  label: PropTypes.any,
  setTables: PropTypes.any,
};
