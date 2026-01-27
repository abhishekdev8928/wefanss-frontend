import React, { useMemo, Fragment, useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Container,
  Table,
  Row,
  Col,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import {
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
  useSortBy,
  useFilters,
  useExpanded,
  usePagination,
} from "react-table";
import PropTypes from "prop-types";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import deleteimg from "../../assets/images/delete.png";
import { toast } from "react-toastify";
import {
  fetchLanguage,
  addLanguage,
  updateLanguage,
  deleteLanguage,
  getLanguageById,
  updateLanguageStatus,
} from "../../api/LanguageApi";

// ================= GLOBAL FILTER ==================
function GlobalFilter({ preGlobalFilteredRows, globalFilter, setGlobalFilter }) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter);

  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <Col md={4}>
      <Input
        type="text"
        className="form-control"
        placeholder={`Search ${count} records...`}
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
      />
    </Col>
  );
}

// ================= FILTER PLACEHOLDER ==================
function Filter() {
  return null;
}

// ================= TABLE CONTAINER ==================
const TableContainer = ({
  columns,
  data,
  customPageSize,
  className,
  isGlobalFilter,
  setModalOpen,
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      defaultColumn: { Filter },
      initialState: {
        pageIndex: 0,
        pageSize: customPageSize,
      },
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination
  );

  const { pageIndex, pageSize } = state;

  return (
    <Fragment>
      <Row className="mb-2">
        <Col md={2}>
          <select
            className="form-select"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </Col>
        {isGlobalFilter && (
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        )}
      </Row>

      <div className="table-responsive react-table">
        <Table bordered hover {...getTableProps()} className={className}>
          <thead className="table-light table-nowrap">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
                  <th key={column.id}>
                    <div {...column.getSortByToggleProps()}>
                      {column.render("Header")}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.id}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} key={cell.column.id}>
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <Row className="justify-content-md-end justify-content-center align-items-center mt-3">
        <Col className="col-md-auto">
          <div className="d-flex gap-1">
            <Button
              color="primary"
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
            >
              {"<<"}
            </Button>
            <Button
              color="primary"
              onClick={previousPage}
              disabled={!canPreviousPage}
            >
              {"<"}
            </Button>
          </div>
        </Col>
        <Col className="col-md-auto d-none d-md-block">
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </Col>
        <Col className="col-md-auto">
          <Input
            type="number"
            min={1}
            max={pageOptions.length}
            style={{ width: 70 }}
            value={pageIndex + 1}
            onChange={(e) => gotoPage(Number(e.target.value) - 1)}
          />
        </Col>
        <Col className="col-md-auto">
          <div className="d-flex gap-1">
            <Button color="primary" onClick={nextPage} disabled={!canNextPage}>
              {">"}
            </Button>
            <Button
              color="primary"
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
            >
              {">>"}
            </Button>
          </div>
        </Col>
      </Row>
    </Fragment>
  );
};

// ================= MAIN COMPONENT ==================
const LanguageMasterList = () => {
  const [language, setLanguage] = useState({ name: "", code: "" });
  const [categorylist, setcategorylist] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [itemIdToEdit, setItemIdToEdit] = useState(null);
  const [errors, setErrors] = useState({});
  const [privileges, setPrivileges] = useState({});
  const [roleName, setRoleName] = useState(localStorage.getItem("role_name") || "");

  const isAdmin =  "admin";

 

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      const result = await fetchLanguage();
      console.log("Language API result:", result);
      setcategorylist(result.msg);
    } catch (error) {
      toast.error("Failed to load languages.");
    }
  };

  // ================= STATUS CHANGE =================
  const handleChange = async (currentStatus, id) => {
    const newStatus = currentStatus == 1 ? 0 : 1;
    try {
      await updateLanguageStatus(id, newStatus);
      toast.success("Status updated successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // ================= EDIT =================
  const handleEdit = async (id) => {
    try {
      const data = await getLanguageById(id);
      setLanguage({ name: data.msg[0].name, code: data.msg[0].code });
      setItemIdToEdit(data.msg[0]._id);
      setModalOpen(true);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  // ================= DELETE =================
  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return toast.error("No ID to delete.");
    try {
      await deleteLanguage(deleteId);
      toast.success("Deleted successfully");
      setDeleteId(null);
      fetchData();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // ================= ADD / UPDATE =================
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!language.name) return setErrors({ name: "Name is required" });
    if (!language.code) return setErrors({ code: "Code is required" });

    try {
      const adminid = localStorage.getItem("adminid");
      const payload = { ...language, createdBy: adminid };
      let res_data;

      if (itemIdToEdit) {
        res_data = await updateLanguage(itemIdToEdit, payload);
        toast.success("Updated successfully");
      } else {
        res_data = await addLanguage(payload);
        toast.success("Added successfully");
      }

      setLanguage({ name: "", code: "" });
      setErrors({});
      setItemIdToEdit(null);
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  // ================= TABLE COLUMNS =================
  const columns = useMemo(
    () => [
      { Header: "No.", accessor: (_row, i) => i + 1 },
      { Header: "Created Date", accessor: "createdAt" },
      { Header: "Name", accessor: "name" },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ row }) => {
          const isActive = row.original.status == 1;
          return (
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                id={`switch-${row.original._id}`}
                checked={isActive}
                onChange={() =>
                  handleChange(row.original.status, row.original._id)
                }
              />
              <label
                className="form-check-label"
                htmlFor={`switch-${row.original._id}`}
              >
                {isActive ? "Active" : "Inactive"}
              </label>
            </div>
          );
        },
      },
      {
        Header: "Option",
        Cell: ({ row }) => (
          <div className="d-flex gap-2">
            {(isAdmin || privileges.languagemasterupdate === "1") && (
              <Button
                color="primary"
                onClick={() => handleEdit(row.original._id)}
                size="sm"
              >
                Edit
              </Button>
            )}
            {(isAdmin || privileges.languagemasterdelete === "1") && (
              <Button
                color="danger"
                size="sm"
                onClick={() => handleDelete(row.original._id)}
              >
                Delete
              </Button>
            )}
          </div>
        ),
      },
    ],
    [categorylist, privileges]
  );

  useEffect(() => {
    fetchData();

  }, []);

  const breadcrumbItems = [
    { title: "Dashboard", link: "/" },
    { title: "Language Master", link: "#" },
  ];

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            title="Language Master"
            breadcrumbItems={breadcrumbItems}
          />

          {(isAdmin || privileges.languagemasteradd === "1") && (
            <div className="d-flex justify-content-end mb-2">
              <Button color="primary" onClick={() => setModalOpen(true)}>
                Add
              </Button>
            </div>
          )}

          {isAdmin || privileges.languagemasterlist === "1" ? (
            <Card>
              <CardBody>
                <TableContainer
                  columns={columns}
                  data={categorylist} // ✅ FIXED
                  customPageSize={10}
                  isGlobalFilter={true}
                  setModalOpen={setModalOpen}
                />
              </CardBody>
            </Card>
          ) : (
            <p className="text-center text-danger mt-4">
              You do not have permission to view this list.
            </p>
          )}
        </Container>

        {/* ADD / EDIT MODAL */}
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
            {!itemIdToEdit ? "Add" : "Edit"} Language
          </ModalHeader>
          <form onSubmit={handleAddSubmit}>
            <ModalBody>
              <Input
                type="text"
                value={language.name || ""}
                onChange={(e) =>
                  setLanguage({ ...language, name: e.target.value })
                }
                name="name"
                placeholder="Name"
                className="mb-2"
              />
              {errors.name && <span className="text-danger">{errors.name}</span>}
              <br />
              <Input
                type="text"
                value={language.code || ""}
                onChange={(e) =>
                  setLanguage({ ...language, code: e.target.value })
                }
                name="code"
                placeholder="Code"
                className="mb-2"
              />
              {errors.code && <span className="text-danger">{errors.code}</span>}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">
                {!itemIdToEdit ? "Add" : "Update"}
              </Button>
              <Button color="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        {/* DELETE MODAL */}
        <Modal isOpen={!!deleteId} toggle={() => setDeleteId(null)}>
          <ModalBody className="mt-3">
            <h4 className="p-3 text-center">
              Do you really want to <br /> delete this record?
            </h4>
            <div className="d-flex justify-content-center">
              <img
                src={deleteimg}
                alt="Delete Icon"
                width={"70%"}
                className="mb-3 m-auto"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={confirmDelete}>
              Delete
            </Button>
            <Button color="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </Fragment>
  );
};

export default LanguageMasterList;
