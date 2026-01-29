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
import { Link } from "react-router-dom";
import deleteimg from "../../assets/images/delete.png";
import { toast } from "react-toastify";
import {
  getCelebraties,
  deleteCelebraty,
  updateCelebratyStatus,
  getProfessions,
  fetchSectionTemplate,
  getSectionMasters,
  getCelebratySectionsByCeleb,
} from "../../api/celebratyApi";
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
            resource={RESOURCES.CELEBRITY}
            action={OPERATIONS.ADD}
          >
            <div className="d-flex justify-content-end">
              <Link to="/dashboard/add-celebrity" className="btn btn-primary">
                Add
              </Link>
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

const CelebratyList = () => {
  const [modalOpen2, setModalOpen2] = useState(false);
  const [allProfessions, setAllProfessions] = useState([]);
  const [allSectionTemplates, setAllSectionTemplates] = useState([]);
  const [allSectionMasters, setAllSectionMasters] = useState([]);
  const [celebraty, setcelebraty] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpen1, setModalOpen1] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [celebratySections, setCelebratySections] = useState([]);

  const { hasPermission } = usePrivilegeStore();

  const fetchSectionMasters = async () => {
    try {
      const res = await getSectionMasters();
      if (res.msg && Array.isArray(res.msg)) {
        setAllSectionMasters(res.msg);
      } else if (res.data && Array.isArray(res.data)) {
        setAllSectionMasters(res.data);
      } else {
        console.warn("No section masters found in API response:", res);
        setAllSectionMasters([]);
      }
    } catch (err) {
      console.error("Error fetching section masters:", err);
    }
  };

  const handleStatusToggle = (id) => {
    setcelebraty((prevList) =>
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

  const fetchProfessions = async () => {
    try {
      const data = await getProfessions();
      if (data.msg && Array.isArray(data.msg)) {
        setAllProfessions(data.msg);
      } else if (Array.isArray(data)) {
        setAllProfessions(data);
      } else {
        console.warn("No professions found in API response:", data);
        setAllProfessions([]);
      }
    } catch (err) {
      console.error("Error fetching professions:", err);
    }
  };

  const fetchData = async () => {
    try {
      const result = await getCelebraties();
      setcelebraty(result.msg || []);
    } catch (error) {
      console.error("Error fetching celebraties:", error);
      toast.error("Failed to load celebraties.");
    }
  };

  const handleChange = async (currentStatus, id) => {
    const newStatus = currentStatus == 1 ? 0 : 1;

    try {
      const res_data = await updateCelebratyStatus(id, newStatus);

      if (res_data.success === false) {
        toast.error(res_data.msg || "Failed to update status");
        return;
      }

      toast.success("Celebraty status updated successfully");
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status. Please try again!");
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setModalOpen2(true);
  };

  const handleClose = () => {
    setModalOpen2(false);
    setDeleteId(null);
  };

  const handleyesno = async () => {
    if (!deleteId) {
      toast.error("No ID to delete.");
      return;
    }

    try {
      const result = await deleteCelebraty(deleteId);

      if (result.status) {
        toast.success("Celebrity deleted successfully!");
        setcelebraty((prev) => prev.filter((row) => row._id !== deleteId));
        setModalOpen2(false);
        setDeleteId(null);
      } else {
        toast.error(result.msg || "Failed to delete celebrity.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong while deleting.");
    }
  };

  const fetchSectionTemplates = async () => {
    try {
      const res = await fetchSectionTemplate();
      if (res.msg && Array.isArray(res.msg)) {
        setAllSectionTemplates(res.msg);
      } else if (res.data && Array.isArray(res.data)) {
        setAllSectionTemplates(res.data);
      } else {
        console.warn("No section templates found in API response:", res);
        setAllSectionTemplates([]);
      }
    } catch (err) {
      console.error("Error fetching section templates:", err);
    }
  };

  useEffect(() => {
    if (celebraty.length > 0) {
      const fetchSectionsForAll = async () => {
        try {
          const allSections = await Promise.all(
            celebraty.map((c) => getCelebratySectionsByCeleb(c._id))
          );
          setCelebratySections(allSections.flat());
        } catch (err) {
          console.error("Error fetching celebraty sections:", err);
        }
      };
      fetchSectionsForAll();
    }
  }, [celebraty]);

  useEffect(() => {
    fetchData();
    fetchProfessions();
    fetchSectionTemplates();
    fetchSectionMasters();
  }, []);

  const canEdit = hasPermission(RESOURCES.CELEBRITY, OPERATIONS.EDIT);
  const canDelete = hasPermission(RESOURCES.CELEBRITY, OPERATIONS.DELETE);
  const hasAnyAction = canEdit || canDelete;

  const columns = [
    { Header: "No.", accessor: (_row, i) => i + 1 },
    { Header: "Created Date", accessor: "createdAt" },
    { Header: "Celebrity Name", accessor: "name" },
    {
      Header: "Celebrity Sections",
      Cell: ({ row }) => {
        const celebSections = celebratySections.filter(
          (cs) => cs.celebratyId === row.original._id
        );

        if (celebSections.length === 0) return "—";

        const uniqueSections = Array.from(
          new Map(
            celebSections.map((cs) => [cs.sectiontemplate, cs])
          ).values()
        );

        return (
          <div className="d-flex flex-wrap gap-2">
            {uniqueSections.map((cs) => (
              <Link
                key={cs._id}
                to={`/dashboard/section-template-list/${row.original._id}/${cs.sectionmaster}`}
                className="btn btn-outline-primary btn-sm"
              >
                {cs.sectiontemplate}
              </Link>
            ))}
          </div>
        );
      },
    },
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
      Cell: ({ row }) => {
        const professionIds =
          typeof row.original.professions === "string"
            ? JSON.parse(row.original.professions || "[]")
            : row.original.professions || [];

        const actorProfession = allProfessions.find(
          (prof) => prof.name.toLowerCase() === "actor"
        );
        const politicianProfession = allProfessions.find(
          (prof) => prof.name.toLowerCase() === "politician"
        );

        const isActor =
          actorProfession && professionIds.includes(actorProfession._id);
        const isPolitician =
          politicianProfession &&
          professionIds.includes(politicianProfession._id);

        return (
          <div className="d-flex gap-2 flex-wrap">
            <PrivilegeAccess
              resource={RESOURCES.CELEBRITY}
              action={OPERATIONS.EDIT}
            >
              <Link
                to={`/dashboard/update-celebrity/${row.original._id}`}
                className="btn btn-primary btn-sm"
              >
                Edit
              </Link>
            </PrivilegeAccess>

            <PrivilegeAccess
              resource={RESOURCES.CELEBRITY}
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

            <Link
              to={`/dashboard/timeline-list/${row.original._id}`}
              className="btn btn-dark btn-sm"
            >
              Timeline Entries
            </Link>

            <Link
              to={`/dashboard/triviaentries-list/${row.original._id}`}
              className="btn btn-outline-dark btn-sm"
            >
              Trivia Entries
            </Link>

            <Link
              to={`/dashboard/customoption-list/${row.original._id}`}
              className="btn btn-dark btn-sm"
            >
              Custom Section
            </Link>

            {isActor && (
              <>
                <Link
                  to={`/dashboard/list-movie/${row.original._id}`}
                  className="btn btn-success btn-sm"
                >
                  Movie
                </Link>
                <Link
                  to={`/dashboard/list-series/${row.original._id}`}
                  className="btn btn-warning btn-sm"
                >
                  TV/Web Series
                </Link>
              </>
            )}

            {isPolitician && (
              <>
                <Link
                  to={`/dashboard/list-election/${row.original._id}`}
                  className="btn btn-info btn-sm"
                >
                  Election
                </Link>
                <Link
                  to={`/dashboardlist-positions/${row.original._id}`}
                  className="btn btn-secondary btn-sm"
                >
                  Positions Held
                </Link>
              </>
            )}
          </div>
        );
      },
    });
  }

  const breadcrumbItems = [
    { title: "Dashboard", link: "/" },
    { title: "Celebrity", link: "#" },
  ];

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Celebrity" breadcrumbItems={breadcrumbItems} />
          <Card>
            <CardBody>
              <TableContainer
                columns={columns}
                data={celebraty}
                customPageSize={10}
                isGlobalFilter={true}
                setModalOpen={setModalOpen}
              />
            </CardBody>
          </Card>
        </Container>

        <Modal isOpen={modalOpen2} toggle={() => setModalOpen1(!modalOpen2)}>
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

export default CelebratyList;