import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSectionTemplateById, saveTemplateData } from "../../api/TemplateApi";
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

const Template = () => {
  const { id, celebId } = useParams(); // id = Section Master ID
  const [section, setSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [mediaPreviews, setMediaPreviews] = useState({});

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const res = await getSectionTemplateById(id);
        const data = res.data;

        setSection(data);

        // Initialize form fields dynamically
        const initialData = {};
        data.fieldsConfig?.forEach((field) => {
          initialData[field._id] = field.type === "media" ? null : "";
        });
        setFormData(initialData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load section master");
      }
    };

    fetchSection();
  }, [id]);

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

    // ✅ Validate required fields
    section.fieldsConfig?.forEach((field) => {
      if (field.isRequired === "true" && !formData[field._id]) {
        newErrors[field._id] = `${field.title} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      // ✅ Prepare FormData
      const formDataToSend = new FormData();
      formDataToSend.append("celebId", celebId);
      formDataToSend.append("templateId", id); // actually sectionId here
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

      const result = await saveTemplateData(formDataToSend);

      if (result.success) {
        toast.success("Data saved successfully!");
      } else {
        toast.error(result.msg || "Failed to save data");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Error saving data");
    }
  };

  if (!section) return <p>Loading section...</p>;

  return (
    <div className="page-content">
      <Container fluid>
        <Card>
          <CardBody>
            <h4 className="mb-4">
              Section: {section.name} ({section.fieldsConfig?.length} fields)
            </h4>

            <Row>
              {section.fieldsConfig?.map((field) => (
                <Col md="6" key={field._id} className="mb-3">
                  <Label>{field.title}</Label>

                  {/* Short text */}
                  {field.type === "text_short" && (
                    <Input
                      type="text"
                      value={formData[field._id]}
                      onChange={(e) =>
                        handleChange(field._id, e.target.value)
                      }
                      placeholder={`Enter ${field.title}`}
                    />
                  )}

                  {/* Long text */}
                  {field.type === "text_long" && (
                    <Input
                      type="textarea"
                      value={formData[field._id]}
                      onChange={(e) =>
                        handleChange(field._id, e.target.value)
                      }
                      placeholder={`Enter ${field.title}`}
                    />
                  )}

                  {/* Date */}
                  {field.type === "date" && (
                    <Input
                      type="date"
                      value={formData[field._id]}
                      onChange={(e) =>
                        handleChange(field._id, e.target.value)
                      }
                    />
                  )}

                  {/* URL */}
                  {field.type === "url" && (
                    <Input
                      type="url"
                      value={formData[field._id]}
                      onChange={(e) =>
                        handleChange(field._id, e.target.value)
                      }
                      placeholder={`Enter URL`}
                    />
                  )}

                  {/* Single Select */}
                  {field.type === "Single Select" && (
                    <Input
                      type="select"
                      value={formData[field._id] || ""}
                      onChange={(e) =>
                        handleChange(field._id, e.target.value)
                      }
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
                      value={formData[field._id] || []}
                      onChange={(e) => {
                        const selectedValues = Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value
                        );
                        handleChange(field._id, selectedValues);
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
                          handleChange(
                            field._id,
                            e.target.files[0],
                            "media"
                          )
                        }
                      />
                      {mediaPreviews[field._id] && (
                        <img
                          src={mediaPreviews[field._id]}
                          alt="Preview"
                          style={{
                            marginTop: 8,
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* Errors */}
                  {errors[field._id] && (
                    <div className="text-danger mt-1">
                      {errors[field._id]}
                    </div>
                  )}
                </Col>
              ))}
            </Row>

            <Button color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default Template;
