import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Label,
  Input,
  Button,
  Container,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import {
  getsectionmasterById,
  updatesectionmaster,
} from "../../api/sectionmasterApi";

const Updatesectionmaster = () => {
  const [sectionmaster, setSectionMaster] = useState({
    name: "",
    slug: "",
    layout: "",
    isRepeater: false, // ✅ added new field
  });
  const navigate = useNavigate();
  const [fields, setFields] = useState([
    { title: "", type: "", isRequired: false, options: [""] },
  ]);
  const [errors, setErrors] = useState({});
  const { id } = useParams();

  const breadcrumbItems = [
    { title: "Dashboard", link: "#" },
    { title: "Update Section Types Master", link: "#" },
  ];
  // Generate year options (1980 - current year + 5)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = 1980; y <= currentYear + 5; y++) {
    yearOptions.push(y);
  }
  // Fetch SectionMaster data
  useEffect(() => {
    const fetchsectionmaster = async () => {
      try {
        const res_data = await getsectionmasterById(id);

        if (res_data.msg) {
          const data = res_data.msg;
          setSectionMaster({
            name: data.name || "",
            slug: data.slug || "",
            layout: data.layout || "",
            isRepeater: data.isRepeater || false, // ✅ load from DB
          });
          if (data.fieldsConfig && data.fieldsConfig.length > 0) {
            setFields(
              data.fieldsConfig.map((f) => ({
                title: f.title || "",
                type: f.type || "",
                isRequired: f.isRequired === true || f.isRequired === "true",
                options:
                  f.options && Array.isArray(f.options)
                    ? f.options.map((opt) =>
                        typeof opt === "string" ? opt : opt.label || ""
                      )
                    : [""],
              }))
            );
          }
        } else {
          toast.error("sectionmaster not found");
        }
      } catch (error) {
        console.error("Fetch sectionmaster error:", error);
        toast.error("Failed to fetch sectionmaster data");
      }
    };

    fetchsectionmaster();
  }, [id]);

  // Input handler
const handleInput = (e) => {
  const { name, value } = e.target;

  // Auto-generate slug when typing name
  if (name === "name") {
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-") // Replace spaces and special chars with hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    setSectionMaster((prev) => ({
      ...prev,
      name: value,
      slug: generatedSlug,
    }));
  } else {
    setSectionMaster((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};

  // ✅ Checkbox handler
  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setSectionMaster((prev) => ({ ...prev, isRepeater: checked }));
  };
  // Field change handler
  const handleFieldChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedFields = [...fields];
    updatedFields[index][name] = type === "checkbox" ? checked : value;

    // Reset options if type is not select
    if (
      name === "type" &&
      value !== "Single Select" &&
      value !== "Multiple Select"
    ) {
      updatedFields[index].options = [""];
    }

    setFields(updatedFields);
  };

  // Option change
  const handleOptionChange = (fieldIndex, optionIndex, value) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options[optionIndex] = value;
    setFields(updatedFields);
  };

  // Add more option
  const addMoreOption = (fieldIndex) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options.push("");
    setFields(updatedFields);
  };

  // Remove option
  const removeOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options.splice(optionIndex, 1);
    setFields(updatedFields);
  };

  // Add / Remove field
  const addMoreField = () => {
    setFields([
      ...fields,
      { title: "", type: "", isRequired: false, options: [""] },
    ]);
  };

  const removeField = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  // ✅ Submit update
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!sectionmaster.name) newErrors.name = "Name is required";
    if (!sectionmaster.slug) newErrors.slug = "Slug is required";
    if (!sectionmaster.layout) newErrors.layout = "Layout is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const adminid = localStorage.getItem("adminid");
      const formData = new FormData();
      formData.append("name", sectionmaster.name);
      formData.append("slug", sectionmaster.slug);
      formData.append("layout", sectionmaster.layout);

      // ✅ Include checkbox value as "1" or "0"
      formData.append("is_repeater", sectionmaster.isRepeater ? "1" : "0");
      formData.append("updatedBy", adminid);
      formData.append("fieldsConfig", JSON.stringify(fields));

      const res_data = await updatesectionmaster(id, formData);

      if (
        res_data?.success === false &&
        res_data?.msg?.includes("already exist")
      ) {
        toast.error(res_data.msg);
        setErrors({ name: res_data.msg });
        return;
      }

      toast.success("sectionmaster updated successfully!");
      navigate("/dashboard/sectionmaster-list");
    } catch (error) {
      console.error("Update sectionmaster Error:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="UPDATE 
Section Types Master"
          breadcrumbItems={breadcrumbItems}
        />
        <Row>
          <Col xl="12">
            <Card>
              <CardBody>
                <form onSubmit={handleUpdateSubmit}>
                  <Row>
                    <Col md="6">
                      <Label>Name</Label>
                      <Input
                        name="name"
                        type="text"
                        placeholder="Enter name"
                        value={sectionmaster.name}
                        onChange={handleInput}
                      />
                      {errors.name && (
                        <span className="text-danger">{errors.name}</span>
                      )}
                    </Col>

                    <Col md="6">
                      <Label>Slug</Label>
                      <Input
                        name="slug"
                        value={sectionmaster.slug}
                        onChange={handleInput}
                        placeholder="Slug"
                        type="text"
                      />
                      {errors.slug && (
                        <span className="text-danger">{errors.slug}</span>
                      )}
                    </Col>

                    <Col md="6">
                      <Label>Layout</Label>
                      <Input
                        type="select"
                        name="layout"
                        onChange={handleInput}
                        value={sectionmaster.layout}
                      >
                        <option value="">Select</option>
                        <option value="List">List</option>
                        <option value="Cards">Cards</option>
                        <option value="Table">Table</option>
                        <option value="Media Gallery">Media Gallery</option>
                      </Input>
                      {errors.layout && (
                        <span className="text-danger">{errors.layout}</span>
                      )}
                    </Col>

                    {/* ✅ Flag: Is Repeater Checkbox */}
                    <Col md="6" className="d-flex align-items-center mt-4">
                      <Label check>
                        <Input
                          type="checkbox"
                          name="isRepeater"
                          checked={sectionmaster.isRepeater}
                          onChange={handleCheckboxChange}
                        />{" "}
                        Flag: Is Repeater —{" "}
                        <strong>
                          {sectionmaster.isRepeater ? "Yes" : "No"}
                        </strong>
                      </Label>
                    </Col>
                  </Row>

                  {/* 🧩 Fields Configuration Section */}
                  <hr />
                  <h5 className="mt-3 mb-2">Fields Configuration</h5>

                  {fields.map((field, index) => (
                    <div key={index} className="border p-3 mb-3 rounded">
                      <Row className="align-items-center">
                        <Col md="4">
                          <Label>Title</Label>
                          <Input
                            name="title"
                            type="text"
                            placeholder="Enter field title"
                            value={field.title}
                            onChange={(e) => handleFieldChange(index, e)}
                          />
                        </Col>

                        <Col md="4">
                          <Label>Field Type</Label>
                          <Input
                            type="select"
                            name="type"
                            value={field.type}
                            onChange={(e) => handleFieldChange(index, e)}
                          >
                            <option value="">Select Type</option>
                            <option value="text_short">Text (Short)</option>
                            <option value="text_long">Text (Long)</option>
                            <option value="rich_text">Rich Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="url">URL (with Label)</option>
                            <option value="media">Media (Image/Video)</option>
                            <option value="Single Select">Single Select</option>
                            <option value="Multiple Select">
                              Multiple Select
                            </option>
                          </Input>
                        </Col>

                        <Col md="2" className="mt-4">
                          <Label check>
                            <Input
                              type="checkbox"
                              name="isRequired"
                              checked={field.isRequired}
                              onChange={(e) => handleFieldChange(index, e)}
                            />{" "}
                            Required
                          </Label>
                        </Col>

                        <Col md="2" className="mt-4">
                          {index > 0 && (
                            <Button
                              color="danger"
                              type="button"
                              onClick={() => removeField(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </Col>
                      </Row>

                      {/* ✅ Options Section for Select Fields */}
                      {(field.type === "Single Select" ||
                        field.type === "Multiple Select") && (
                        <div className="mt-3">
                          <h6>Options</h6>
                          {field.options.map((opt, optIndex) => (
                            <Row
                              key={optIndex}
                              className="align-items-center mb-2"
                            >
                              <Col md="8">
                                <Input
                                  type="text"
                                  placeholder={`Option ${optIndex + 1}`}
                                  value={opt}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      index,
                                      optIndex,
                                      e.target.value
                                    )
                                  }
                                />
                              </Col>
                              <Col md="4">
                                {optIndex > 0 && (
                                  <Button
                                    color="danger"
                                    type="button"
                                    onClick={() =>
                                      removeOption(index, optIndex)
                                    }
                                  >
                                    Remove
                                  </Button>
                                )}
                              </Col>
                            </Row>
                          ))}
                          <Button
                            color="secondary"
                            type="button"
                            onClick={() => addMoreOption(index)}
                          >
                            + Add More Option
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  <Button
                    color="secondary"
                    type="button"
                    onClick={addMoreField}
                    className="mt-2"
                  >
                    + Add More Field
                  </Button>
                  <br></br>
                  <Button color="primary" type="submit" className="mt-3 ms-2">
                    Update
                  </Button>
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Updatesectionmaster;
