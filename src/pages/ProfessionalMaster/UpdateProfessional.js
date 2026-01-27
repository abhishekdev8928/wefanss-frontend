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
  getprofessionalmasterById,
  updateprofessionalmaster,
  getSectionTemplateOptions,
} from "../../api/professionalmasterApi";
import Select from "react-select";

const Updateprofessionalmaster = () => {
  const [professionalmaster, setprofessionalmaster] = useState({
    name: "",
    slug: "",
    image: null,
    old_image: "",
    sectiontemplate: [], // ✅ Initialize to avoid undefined errors
  });
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const { id } = useParams();
  const [sectiontemplateOptions, setSectionTemplateOptions] = useState([]);

  const breadcrumbItems = [
    { title: "Dashboard", link: "#" },
    { title: "Update Profession Master", link: "#" },
  ];
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
  // Fetch professionalmaster data
  useEffect(() => {
    const fetchprofessionalmaster = async () => {
      try {
        const res_data = await getprofessionalmasterById(id);

        if (res_data.msg) {
          const data = res_data.msg;
          setprofessionalmaster({
            name: data.name || "",
            slug: data.slug || "",
            old_image: data.image || "",
            sectiontemplate: data.sectiontemplate
              ? data.sectiontemplate.map((st) => st._id || st)
              : [],
          });
        } else {
          toast.error("professionalmaster not found");
        }
      } catch (error) {
        console.error("Fetch professionalmaster error:", error);
        toast.error("Failed to fetch professionalmaster data");
      }
    };

    fetchprofessionalmaster();
    fetchSectionTemplateOptions();
  }, [id]);

  // Input handler
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
    setprofessionalmaster({
      ...professionalmaster,
      [name]: value,
    });
  }
};

  // Handle file change
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setprofessionalmaster((prev) => ({ ...prev, [name]: files[0] }));
  };

  // ✅ Submit update
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!professionalmaster.name) newErrors.name = "Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const adminid = localStorage.getItem("adminid");
      const formData = new FormData();

      formData.append("name", professionalmaster.name);
      formData.append("slug", professionalmaster.slug);
      // ✅ Append sectiontemplate array as JSON string
      formData.append(
        "sectiontemplate",
        JSON.stringify(professionalmaster.sectiontemplate || [])
      );
      formData.append("updatedBy", adminid);
      if (professionalmaster.image)
        formData.append("image", professionalmaster.image);

      const res_data = await updateprofessionalmaster(id, formData);

      if (
        res_data.success === false ||
        res_data.msg === "professionalmaster already exist"
      ) {
        toast.error(res_data.msg || "Failed to update professionalmaster");
        return;
      }

      toast.success("professionalmaster updated successfully!");
      navigate("/dashboard/professional-list");
    } catch (error) {
      console.error("Update professionalmaster Error:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="UPDATE 
Profession Master"
          breadcrumbItems={breadcrumbItems}
        />
        <Row>
          <Col xl="12">
            <Card>
              <CardBody>
                <form
                  className="needs-validation"
                  onSubmit={handleUpdateSubmit}
                >
                  <Row>
                    <Col md="6">
                      <Label> Name</Label>
                      <Input
                        name="name"
                        type="text"
                        placeholder="Name"
                        value={professionalmaster.name} // ✅ correct usage
                        onChange={handleInput}
                      />
                      {errors.name && (
                        <span className="text-danger">{errors.name}</span>
                      )}
                    </Col>
                    {/* Main Image */}
                    <Col md="6">
                      <Label className="form-label">Image</Label>
                      <Input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {professionalmaster.old_image && (
                        <div className="mt-2">
                          <img
                            src={`${process.env.REACT_APP_API_BASE_URL}/professionalmaster/${professionalmaster.old_image}`}
                            alt="Main"
                            width="100"
                            className="rounded border"
                          />
                        </div>
                      )}
                    </Col>
                    <Col md="6">
                      <Label> Slug</Label>
                      <Input
                        name="slug"
                        type="text"
                        placeholder="Slug"
                        value={professionalmaster.slug} // ✅ correct usage
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

export default Updateprofessionalmaster;
