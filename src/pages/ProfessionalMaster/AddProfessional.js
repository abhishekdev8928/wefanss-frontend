import React, { useState, useEffect } from "react";
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
import {
  addprofessionalmaster,
  getSectionTemplateOptions,
} from "../../api/professionalmasterApi";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const Addprofessionalmaster = () => {
  const [professionalmaster, setprofessionalmaster] = useState({
    name: "",
    slug: "",
    image: null,
    sectiontemplate: [], // ✅ Initialize to empty array
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [sectiontemplateOptions, setSectionTemplateOptions] = useState([]);
  useEffect(() => {
    fetchSectionTemplateOptions();
  }, []);
  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Add Profession ", link: "#" },
  ];

const handleInput = (e) => {
  const { name, value } = e.target;

  // Auto-generate slug when name changes
  if (name === "name") {
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
      .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens

    setprofessionalmaster({
      ...professionalmaster,
      name: value,
      slug: generatedSlug,
    });
  } else {
    setprofessionalmaster({ ...professionalmaster, [name]: value });
  }
};

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setprofessionalmaster((prev) => ({
      ...prev,
      [name]: files[0], // store single file object
    }));
  };

  const fetchSectionTemplateOptions = async () => {
    try {
      const data = await getSectionTemplateOptions();
      const options = (data.msg || []).map((item) => ({
        value: item._id,
        label: item.title?.trim() || item.title,
      }));
      setSectionTemplateOptions(options);
    } catch (err) {
      console.error("Error fetching language options:", err);
    }
  };

  // ✅ Submit handler
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation
    if (!professionalmaster.name) newErrors.name = "Name is required";
    if (!professionalmaster.slug) newErrors.slug = "Slug is required";
    if (!professionalmaster.image) newErrors.image = "Image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const adminid = localStorage.getItem("adminid");

      const formData = new FormData();
      formData.append("name", professionalmaster.name);
      formData.append("slug", professionalmaster.slug);
      // ✅ Append selected sectiontemplate IDs
      if (professionalmaster.sectiontemplate.length > 0) {
        formData.append(
          "sectiontemplate",
          JSON.stringify(professionalmaster.sectiontemplate)
        );
      }
      formData.append("createdBy", adminid);
      if (professionalmaster.image)
        formData.append("image", professionalmaster.image);

      // ✅ Use API helper instead of raw fetch
      const res_data = await addprofessionalmaster(formData);
      console.log("API Response:", res_data);

      if (
        res_data.success === false ||
        res_data.msg === "professionalmaster already exist"
      ) {
        toast.error(res_data.msg || "Failed to add professionalmaster");
        return;
      }

      toast.success("Professionalmaster added successfully!");
      setErrors({});
      navigate("/dashboard/professional-list");
    } catch (error) {
      console.error("Add professionalmaster Error:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Profession Master"
          breadcrumbItems={breadcrumbItems}
        />
        <Row>
          <Col xl="12">
            <Card>
              <CardBody>
                <form onSubmit={handleAddSubmit}>
                  <Row>
                    <Col md="6">
                      <Label> Name</Label>
                      <Input
                        name="name"
                        type="text"
                        placeholder="Name"
                        value={professionalmaster.name}
                        onChange={handleInput}
                      />
                      {errors.name && (
                        <span className="text-danger">{errors.name}</span>
                      )}
                    </Col>

                    {/* Main Image */}
                    <Col md="6">
                      <div className="mb-3">
                        <Label className="form-label"> Image</Label>
                        <Input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        {errors.image && (
                          <span className="text-danger">{errors.image}</span>
                        )}
                        {professionalmaster.image && (
                          <small className="text-success">
                            {professionalmaster.image.name}
                          </small>
                        )}
                      </div>
                    </Col>

                    <Col md="6">
                      <Label> Slug</Label>
                      <Input
                        name="slug"
                        type="text"
                        placeholder="Slug"
                        value={professionalmaster.slug}
                        onChange={handleInput}
                      />
                      {errors.slug && (
                        <span className="text-danger">{errors.slug}</span>
                      )}
                    </Col>
                    <Col md="6">
                      <Label>Default Section Templates</Label>
                      <Select
                        isMulti
                        name="sectiontemplate"
                        options={sectiontemplateOptions}
                        value={sectiontemplateOptions.filter((opt) =>
                          professionalmaster.sectiontemplate.includes(opt.value)
                        )}
                        onChange={(selectedOptions) =>
                          setprofessionalmaster((prev) => ({
                            ...prev,
                            sectiontemplate: selectedOptions.map(
                              (opt) => opt.value
                            ),
                          }))
                        }
                        placeholder="Choose..."
                      />
                    </Col>
                  </Row>
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

export default Addprofessionalmaster;
