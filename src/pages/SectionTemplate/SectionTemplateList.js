import React, { Fragment, useState, useEffect } from "react";
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
  Label,
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
import prvi from "../../assets/images/privileges.png";
import deleteimg from "../../assets/images/delete.png";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Select from "react-select";

import {
  fetchSectionTemplate,
  addSectionTemplate,
  updateSectionTemplate,
  deleteSectionTemplate,
  getSectionTemplateById,
  updateSectionTemplateStatus,
  getSectionsOptions,
} from "../../api/SectionTemplateApi";
import PrivilegeAccess from "../../components/protection/PrivilegeAccess";
import { RESOURCES, OPERATIONS } from "../../constant/privilegeConstants";
import { usePrivilegeStore } from "../../config/store/privilegeStore";

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
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

function Filter() {
  return null;
}

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
        <Col md={6}>
          <PrivilegeAccess
            resource={RESOURCES.SECTION_TEMPLATE}
            action={OPERATIONS.ADD}
          >
            <div className="d-flex justify-content-end">
              <Button color="primary" onClick={() => setModalOpen(true)}>
                Add
              </Button>
            </div>
          </PrivilegeAccess>
        </Col>
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

TableContainer.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  customPageSize: PropTypes.number,
  className: PropTypes.string,
  isGlobalFilter: PropTypes.bool,
  setModalOpen: PropTypes.func.isRequired,
};

const RoleMasterList = () => {
  const [category, setcategory] = useState({
    title: "",
    sections: [],
  });

  const [rolelist, setcategorylist] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpen1, setModalOpen1] = useState(false);
  const [sectionsOptions, setSectionsOptions] = useState([]);
  const [modalOpen2, setModalOpen2] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const [errors, setErrors] = useState({});

  const { hasPermission } = usePrivilegeStore();

  const handleDelete = (id) => {
    setDeleteId(id);
    setModalOpen2(true);
  };

  const handleClose = () => {
    setModalOpen2(false);
    setDeleteId(null);
  };

  const fetchData = async () => {
    try {
      const result = await fetchSectionTemplate();
      setcategorylist(result.msg);
    } catch (error) {
      toast.error("Failed to load categories.");
    }
  };

  const handleChange = async (currentStatus, id) => {
    const newStatus = currentStatus == 1 ? 0 : 1;
    try {
      await updateSectionTemplateStatus(id, newStatus);
      toast.success("Status updated successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleedit = async (id) => {
    try {
      const data = await getSectionTemplateById(id);
      const template = data.msg[0];

      setcategory({
        title: template.title || "",
        sections: template.sections ? template.sections.map((sec) => sec._id || sec) : [],
      });

      setItemIdToDelete(template._id);
      setModalOpen(true);
    } catch (error) {
      toast.error("Failed to load section template data");
    }
  };

  const handleyesno = async () => {
    if (!deleteId) return toast.error("No ID to delete.");
    try {
      const data = await deleteSectionTemplate(deleteId);
      toast.success("Deleted successfully");
      setModalOpen2(false);
      fetchData();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleStatusToggle = (id) => {
    setcategorylist((prevList) =>
      prevList.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Active" ? "Inactive" : "Active",
            }
          : item
      )
    );
  };

  const canEdit = hasPermission(RESOURCES.SECTION_TEMPLATE, OPERATIONS.EDIT);
  const canDelete = hasPermission(RESOURCES.SECTION_TEMPLATE, OPERATIONS.DELETE);
  const hasAnyAction = canEdit || canDelete;

  const columns = [
    { Header: "No.", accessor: (_row, i) => i + 1 },
    { Header: "Created Date", accessor: "createdAt" },
    { Header: "Section Title", accessor: "title" },
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
  ];

  if (hasAnyAction) {
    columns.push({
      Header: "Option",
      Cell: ({ row }) => (
        <div className="d-flex gap-2">
          <PrivilegeAccess
            resource={RESOURCES.SECTION_TEMPLATE}
            action={OPERATIONS.EDIT}
          >
            <Button
              color="primary"
              onClick={() => handleedit(row.original._id)}
              size="sm"
            >
              Edit
            </Button>
          </PrivilegeAccess>

          <PrivilegeAccess
            resource={RESOURCES.SECTION_TEMPLATE}
            action={OPERATIONS.DELETE}
          >
            <Button
              color="danger"
              size="sm"
              onClick={() => handleDelete(row.original._id)}
            >
              Delete
            </Button>
          </PrivilegeAccess>
        </div>
      ),
    });
  }

  const breadcrumbItems = [
    { title: "Dashboard", link: "/" },
    { title: "Section Template", link: "#" },
  ];

  const handleinput = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setcategory({
      ...category,
      [name]: value,
    });
  };

  const handleClose1 = () => {
    setModalOpen(false);
    setItemIdToDelete(null);
    setcategory({
      title: "",
      sections: [],
    });
  };

  const handleaddsubmit = async (e) => {
    e.preventDefault();

    if (!category.title) {
      setErrors({ title: "Title is required" });
      return;
    }
    if (!category.sections || category.sections.length === 0) {
      setErrors({ sections: "At least one section must be selected" });
      return;
    }

    try {
      const adminid = localStorage.getItem("adminid");
      const payload = { ...category, createdBy: adminid };
      let res_data;

      if (itemIdToDelete) {
        res_data = await updateSectionTemplate(itemIdToDelete, payload);

        if (res_data.success === false || res_data.error) {
          toast.error(res_data.msg || "Update failed.");
          return;
        }

        toast.success("Updated successfully");
      } else {
        res_data = await addSectionTemplate(payload);

        if (res_data.success === false || res_data.error) {
          toast.error(res_data.msg || "Add failed.");
          return;
        }

        toast.success("Added successfully");
      }

      handleClose1();
      setcategory({ title: "", sections: [] });
      setErrors({});
      fetchData();
    } catch (error) {
      console.error("Add/Update Template Error:", error);
      toast.error("Something went wrong.");
    }
  };

  const fetchSectionsOptions = async () => {
    try {
      const data = await getSectionsOptions();
      const options = (data.msg || []).map((item) => ({
        value: item._id,
        label: item.name?.trim() || item.name,
      }));
      setSectionsOptions(options);
    } catch (err) {
      console.error("Error fetching sections options:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSectionsOptions();
  }, []);

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Section Template List" breadcrumbItems={breadcrumbItems} />
          <Card>
            <CardBody>
              <TableContainer
                columns={columns}
                data={rolelist}
                customPageSize={10}
                isGlobalFilter={true}
                setModalOpen={setModalOpen}
              />
            </CardBody>
          </Card>
        </Container>

        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
            {!itemIdToDelete ? "Add" : "Edit"} Section Template
          </ModalHeader>

          <form onSubmit={handleaddsubmit}>
            <ModalBody>
              <Label>Title</Label>
              <Input
                type="text"
                value={category.title || ""}
                onChange={handleinput}
                name="title"
                placeholder="Enter title"
                className="mb-2"
              />
              {errors.title && <span className="text-danger">{errors.title}</span>}

              <br />

              <Label>Select Multiple Sections</Label>
              <Select
                isMulti
                name="sections"
                options={sectionsOptions}
                value={sectionsOptions.filter((opt) =>
                  (category.sections || []).includes(opt.value)
                )}
                onChange={(selectedOptions) =>
                  setcategory((prev) => ({
                    ...prev,
                    sections: selectedOptions.map((opt) => opt.value),
                  }))
                }
                placeholder="Choose..."
              />
              {errors.sections && (
                <span className="text-danger">{errors.sections}</span>
              )}
            </ModalBody>

            <ModalFooter>
              <Button color="primary" type="submit">
                {!itemIdToDelete ? "Add" : "Update"}
              </Button>
              <Button color="secondary" onClick={handleClose1}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        <Modal isOpen={modalOpen1} toggle={() => setModalOpen1(!modalOpen1)}>
          <ModalHeader toggle={() => setModalOpen1(!modalOpen1)}>
            Update Blog Category
          </ModalHeader>
          <ModalBody>
            <Input type="text" placeholder="Name" className="mb-2" />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => setModalOpen1(false)}>
              Update
            </Button>
            <Button color="secondary" onClick={() => setModalOpen1(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={modalOpen2} toggle={() => setModalOpen2(false)}>
          <ModalBody className="mt-3">
            <h4 className="p-3 text-center">
              Do you really want to <br /> delete the file?
            </h4>
            <div className="d-flex justify-content-center">
              <img
                src={deleteimg}
                alt="Privilege Icon"
                width={"70%"}
                className="mb-3 m-auto"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={handleyesno}>
              Delete
            </Button>
            <Button color="secondary" onClick={() => handleClose()}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </Fragment>
  );
};

export default RoleMasterList;