import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Input,
  Container,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { addsectionmaster } from "../../api/sectionmasterApi";
import { useNavigate } from "react-router-dom";

const Addsectionmaster = () => {
  const [sectionmaster, setSectionMaster] = useState({
    name: "",
    url: "",
    layout: "",
    isRepeater: false, // ✅ New field
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [fields, setFields] = useState([
    { title: "", type: "", isRequired: false, options: [""] }, // Default first field
  ]);
  const breadcrumbItems = [
    { title: "Dashboard", link: "#" },
    { title: "Add Section Types Master", link: "#" },
  ];

  // Generate year options (1980 - current year + 5)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = 1980; y <= currentYear + 5; y++) {
    yearOptions.push(y);
  }

  const handleInput = (e) => {
  const { name, value } = e.target;

  // Auto-generate slug when typing the name
  if (name === "name") {
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-") // Replace spaces & special chars with "-"
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


  // ✅ Handle Checkbox Change
  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setSectionMaster((prev) => ({ ...prev, isRepeater: checked }));
  };
  // ✅ Handle Field Change (Title, Type, Required)
  const handleFieldChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedFields = [...fields];
    updatedFields[index][name] = type === "checkbox" ? checked : value;

    // If user changes type, reset options for non-select types
    if (name === "type" && value !== "Single Select") {
      updatedFields[index].options = [""];
    }

    setFields(updatedFields);
  };

  // ✅ Handle Option Change
  const handleOptionChange = (fieldIndex, optionIndex, value) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options[optionIndex] = value;
    setFields(updatedFields);
  };

  // ✅ Add More Option
  const addMoreOption = (fieldIndex) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options.push("");
    setFields(updatedFields);
  };

  // ✅ Remove Option
  const removeOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options.splice(optionIndex, 1);
    setFields(updatedFields);
  };

  // ✅ Add New Field
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
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // ✅ Validation
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
      formData.append("is_repeater", sectionmaster.isRepeater ? "1" : "0");

      formData.append("createdBy", adminid);
      formData.append("fieldsConfig", JSON.stringify(fields));
      const res_data = await addsectionmaster(formData);
      console.log("API Response:", res_data);

      if (res_data?.success === true) {
        toast.success(
          res_data.msg || "section type master added successfully!"
        );
        setErrors({});
        navigate("/dashboard/sectionmaster-list");
      }
      if (
        res_data?.success === false &&
        res_data?.msg?.includes("already exist")
      ) {
        toast.error(res_data.msg);
        setErrors({ name: res_data.msg });
        return;
      }
    } catch (error) {
      console.error("Add sectionmaster Error:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Section Types Master"
          breadcrumbItems={breadcrumbItems}
        />
        <Row>
          <Col xl="12">
            <Card>
              <CardBody>
                <form onSubmit={handleAddSubmit}>
                  <Row>
                    {/* Title */}
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
                      <Label>Status</Label>
                      <Input
                        type="select"
                        name="layout"
                        onChange={handleInput}
                        value={sectionmaster.layout}
                      >
                        <option value="">Select</option>
                        <option value="List">List</option>
                        <option value="Cards">Cards </option>
                        <option value="Table">Table</option>
                        <option value="Media Gallery">Media Gallery</option>
                      </Input>
                      {errors.layout && (
                        <span className="text-danger">{errors.layout}</span>
                      )}
                    </Col>

                    {/* ✅ Is Repeater Checkbox */}
                    <Col md="6" className="d-flex align-items-center mt-4">
                      <div>
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
                      </div>
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

                      {/* ✅ Options Section (only for select types) */}
                      {(field.type === "Single Select" ||
                        field.type === "Multiple Select") && (
                        <div className="mt-3">
                          <h6>
                            {field.type === "Single Select"
                              ? "Single Select Options"
                              : "Multiple Select Options"}
                          </h6>
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

                  <br />
                  <Button color="primary" type="submit" className="mt-3">
                    Add
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

export default Addsectionmaster;
