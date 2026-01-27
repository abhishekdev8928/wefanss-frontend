import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Input,
  Button,
  Label,
  Row,
  Col,
  Container,
  Card,
  CardBody,
} from "reactstrap";
import { toast } from "react-toastify";
import {
  getSectionTemplateById,
  getTemplateDataById, // ✅ new API to fetch existing data
  updateTemplateData, // ✅ new API to update
} from "../../api/TemplateApi";

const TemplateEdit = () => {
  const { celebId, sectionId, dataId } = useParams(); 
  // 👆 dataId = the specific record id to edit
  // Example route: /section-template-edit/:celebId/:sectionId/:dataId

  const [section, setSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [mediaPreviews, setMediaPreviews] = useState({});

useEffect(() => {
  const fetchData = async () => {
    try {
      const sectionRes = await getSectionTemplateById(sectionId);
      const dataRes = await getTemplateDataById(celebId, sectionId, dataId);

      console.log("Section Response:", sectionRes);
      console.log("Data Response:", dataRes);

      const sectionData = sectionRes.data;
      const existingData = dataRes.data || {};

      setSection(sectionData);

      // ✅ Map field IDs to actual data values using field.title
      const initialData = {};
      sectionData.fieldsConfig?.forEach((field) => {
        const fieldTitle = field.title;
        initialData[field._id] = existingData[fieldTitle] || "";
      });

      setFormData(initialData);
    } catch (err) {
      console.error("Error loading edit data:", err);
      toast.error("Failed to load section data");
    }
  };

  fetchData();
}, [celebId, sectionId, dataId]);


  const handleChange = (fieldId, value, type) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));

    if (type === "media" && value) {
      setMediaPreviews((prev) => ({
        ...prev,
        [fieldId]: URL.createObjectURL(value),
      }));
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};

    // Validate required fields
    section.fieldsConfig?.forEach((field) => {
      if (field.isRequired === "true" && !formData[field._id]) {
        newErrors[field._id] = `${field.title} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix validation errors");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("celebId", celebId);
      formDataToSend.append("templateId", sectionId);
      formDataToSend.append("dataId", dataId); // include for backend to know which one to update
      formDataToSend.append("sectionName", section.name.toLowerCase());

      section.fieldsConfig?.forEach((field) => {
        const value = formData[field._id];
        if (value instanceof File) {
          formDataToSend.append(`${section.name}.${field.title}`, value);
        } else if (Array.isArray(value)) {
          value.forEach((v) =>
            formDataToSend.append(`${section.name}.${field.title}[]`, v)
          );
        } else {
          formDataToSend.append(`${section.name}.${field.title}`, value);
        }
      });

      const result = await updateTemplateData(formDataToSend);

      if (result.success) {
        toast.success("Data updated successfully!");
      } else {
        toast.error(result.msg || "Failed to update data");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error updating data");
    }
  };

  if (!section) return <p>Loading section...</p>;

  return (
    <div className="page-content">
      <Container fluid>
        <Card>
          <CardBody>
            <h4 className="mb-4">Edit Section: {section.name}</h4>

            <Row>
              {section.fieldsConfig?.map((field) => (
                <Col md="6" key={field._id} className="mb-3">
                  <Label>{field.title}</Label>

                  {/* Text Short */}
                  {field.type === "text_short" && (
                    <Input
                      type="text"
                      value={formData[field._id]}
                      onChange={(e) => handleChange(field._id, e.target.value)}
                    />
                  )}

                  {/* Text Long */}
                  {field.type === "text_long" && (
                    <Input
                      type="textarea"
                      value={formData[field._id]}
                      onChange={(e) => handleChange(field._id, e.target.value)}
                    />
                  )}

                  {/* Date */}
                  {field.type === "date" && (
                    <Input
                      type="date"
                      value={formData[field._id]}
                      onChange={(e) => handleChange(field._id, e.target.value)}
                    />
                  )}

                  {/* URL */}
                  {field.type === "url" && (
                    <Input
                      type="url"
                      value={formData[field._id]}
                      onChange={(e) => handleChange(field._id, e.target.value)}
                    />
                  )}

                  {/* Single Select */}
                  {field.type === "Single Select" && (
                    <Input
                      type="select"
                      value={formData[field._id]}
                      onChange={(e) => handleChange(field._id, e.target.value)}
                    >
                      <option value="">Select {field.title}</option>
                      {field.options?.map((opt) => (
                        <option key={opt._id} value={opt._id}>
                          {opt.name || opt.title || opt.label}
                        </option>
                      ))}
                    </Input>
                  )}

                  {/* Multiple Select */}
                  {field.type === "Multiple Select" && (
                    <Input
                      type="select"
                      multiple
                      value={Array.isArray(formData[field._id]) ? formData[field._id] : []}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value
                        );
                        handleChange(field._id, selected);
                      }}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt._id} value={opt._id}>
                          {opt.name || opt.title || opt.label}
                        </option>
                      ))}
                    </Input>
                  )}

                  {/* Media */}
                  {field.type === "media" && (
                    <>
                      <Input
                        type="file"
                        onChange={(e) =>
                          handleChange(field._id, e.target.files[0], "media")
                        }
                      />
                      {mediaPreviews[field._id] ? (
                        <img
                          src={mediaPreviews[field._id]}
                          alt="Preview"
                          style={{ marginTop: 8, width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
                        />
                      ) : formData[field._id] ? (
                        <img
                          src={`${process.env.REACT_APP_API_BASE_URL}${formData[field._id]}`}
                          alt="Current"
                          style={{ marginTop: 8, width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
                        />
                      ) : null}
                    </>
                  )}

                  {errors[field._id] && (
                    <div className="text-danger mt-1">{errors[field._id]}</div>
                  )}
                </Col>
              ))}
            </Row>

            <Button color="primary" onClick={handleSubmit}>
              Update
            </Button>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default TemplateEdit;
