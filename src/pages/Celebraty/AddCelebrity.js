// AddCelebrityForm.jsx - Add Celebrity Component
import React, { useState, useEffect } from "react";
import RichTextEditor from "../../components/editor/RichTextEditor";
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
import Select from "react-select";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  getLanguageOptions,
  getProfessionsOptions,
  addCelebraty,
  getSocialLinksOptions,
} from "../../api/celebratyApi";

const AddCelebrityForm = () => {
  const navigate = useNavigate();

  const [breadcrumbItems] = useState([
    { title: "Dashboard", link: "#" },
    { title: "Add Celebrity", link: "#" },
  ]);

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [languagesOptions, setLanguageOptions] = useState([]);
  const [professionsOptions, setProfessionsOptions] = useState([]);
  const [socialLinksOptions, setSocialLinksOptions] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortinfo: "",
    biography: "",
    gender: "",
    dob: "",
    languages: [],
    professions: [],
    statusnew: "Draft",
    socialLinks: [],
    previewImage: "",
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setGalleryFiles((prev) => [...prev, ...acceptedFiles]);
    },
    accept: { "image/*": [] },
    multiple: true,
  });

  useEffect(() => {
    fetchLanguageOptions();
    fetchProfessionsOptions();
    fetchSocialLinksOptions();
  }, []);

  const fetchSocialLinksOptions = async () => {
    try {
      const data = await getSocialLinksOptions();
      const options = (data.msg || []).map((item) => ({
        value: item._id,
        label: item.name?.trim() || item.name,
        url: item.url || "",
      }));
      setSocialLinksOptions(options);
    } catch (err) {
      console.error("Error fetching social link options:", err);
    }
  };

  const fetchLanguageOptions = async () => {
    try {
      const data = await getLanguageOptions();
      const options = (data.msg || []).map((item) => ({
        value: item._id,
        label: item.name?.trim() || item.name,
      }));
      setLanguageOptions(options);
    } catch (err) {
      console.error("Error fetching language options:", err);
    }
  };

  const fetchProfessionsOptions = async () => {
    try {
      const data = await getProfessionsOptions();
      const options = (data.msg || []).map((item) => ({
        value: item._id,
        label: item.name?.trim() || item.name,
      }));
      setProfessionsOptions(options);
    } catch (err) {
      console.error("Error fetching profession options:", err);
    }
  };

  const isValidSocialUrl = (url) => {
    if (!url || url.trim() === "") return true;
    const pattern = /^(https?:\/\/)?(www\.)[a-zA-Z0-9_-]+(\.[a-z]{2,})(\/.*)?$/;
    return pattern.test(url.trim());
  };

  const handleInput = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generatedSlug,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.slug) newErrors.slug = "Slug is required";
    if (!formData.shortinfo) newErrors.shortinfo = "Short Intro is required";
    if (!formData.biography) newErrors.biography = "Biography is required";
    if (!formData.professions?.length)
      newErrors.professions = "Professions are required";
    if (!formData.languages?.length)
      newErrors.languages = "Languages are required";
    if (!formData.statusnew) newErrors.statusnew = "Status is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("shortinfo", formData.shortinfo);
      formDataToSend.append("biography", formData.biography);
      formDataToSend.append("statusnew", formData.statusnew);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("dob", formData.dob);
      // Ensure arrays are properly formatted before stringify
      const professionsArray = Array.isArray(formData.professions) 
        ? formData.professions 
        : [];
      const languagesArray = Array.isArray(formData.languages) 
        ? formData.languages 
        : [];
      const socialLinksArray = Array.isArray(formData.socialLinks)
        ? formData.socialLinks
        : [];

      formDataToSend.append("professions", JSON.stringify(professionsArray));
      formDataToSend.append("languages", JSON.stringify(languagesArray));
      formDataToSend.append("socialLinks", JSON.stringify(socialLinksArray));

      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      // Gallery files
      if (galleryFiles.length > 0) {
        galleryFiles.forEach((file) => {
          formDataToSend.append("gallery", file);
        });
      }

      const adminid = localStorage.getItem("adminid");
      formDataToSend.append("createdBy", adminid);

      const result = await addCelebraty(formDataToSend);

      if (!result.status) {
        toast.error(result.msg || "Failed to add celebrity.");
        return;
      }

      toast.success("Celebrity Added Successfully");
      navigate("/dashboard/celebrity-list");

      // Reset form
      setFormData({
        name: "",
        dob: "",
        gender: "",
        slug: "",
        shortinfo: "",
        biography: "",
        languages: [],
        professions: [],
        statusnew: "Draft",
        socialLinks: [],
        previewImage: "",
      });
      setSelectedFile(null);
      setGalleryFiles([]);
      setErrors({});
    } catch (err) {
      console.error("Add celebrity Error:", err);
      toast.error("Something went wrong while adding celebrity.");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="ADD Celebrity"
          breadcrumbItems={breadcrumbItems}
        />
        <Row>
          <Col xl="12">
            <Card>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <Row>
                    <Col md="6" className="mb-3">
                      <Label>
                        Name <span className="text-danger">*</span>
                      </Label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInput}
                        placeholder="Name"
                        type="text"
                        required
                      />
                      {errors.name && (
                        <span className="text-danger">{errors.name}</span>
                      )}
                    </Col>

                    <Col md="6" className="mb-3">
                      <Label>
                        Slug <span className="text-danger">*</span>
                      </Label>
                      <Input
                        name="slug"
                        value={formData.slug}
                        onChange={handleInput}
                        placeholder="Slug"
                        type="text"
                        required
                      />
                      {errors.slug && (
                        <span className="text-danger">{errors.slug}</span>
                      )}
                    </Col>

                    <Col md="6" className="mb-3">
                      <Label>Gender</Label>
                      <Input
                        type="select"
                        name="gender"
                        onChange={handleInput}
                        value={formData.gender}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Input>
                    </Col>

                    <Col md="6" className="mb-3">
                      <Label>DOB</Label>
                      <Input
                        name="dob"
                        value={formData.dob}
                        onChange={handleInput}
                        placeholder="DOB"
                        type="date"
                      />
                    </Col>

                    <Col md="6" className="mb-3">
                      <Label className="form-label">Profile Image</Label>
                      <Input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                            setFormData((prev) => ({
                              ...prev,
                              previewImage: URL.createObjectURL(file),
                            }));
                          }
                        }}
                      />

                      {formData.previewImage && (
                        <div className="mt-2 position-relative d-inline-block">
                          <img
                            src={formData.previewImage}
                            alt="Preview"
                            width="100"
                            className="rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setFormData((prev) => ({
                                ...prev,
                                previewImage: "",
                              }));
                            }}
                            style={{
                              position: "absolute",
                              top: "-8px",
                              right: "-8px",
                              background: "red",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "22px",
                              height: "22px",
                              cursor: "pointer",
                            }}
                            title="Remove Image"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </Col>

                    <Col md="12" className="mb-3">
                      <Label className="form-label">Gallery Images</Label>
                      <div
                        {...getRootProps()}
                        className={`border border-dashed p-4 text-center rounded bg-light ${
                          isDragActive ? "bg-primary bg-opacity-10" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                          <p className="mb-0 text-primary fw-bold">
                            Drop images here...
                          </p>
                        ) : (
                          <p className="mb-0 text-muted">
                            Drag & drop images here, or{" "}
                            <strong>click to select</strong>
                          </p>
                        )}
                      </div>

                      {galleryFiles.length > 0 && (
                        <div className="mt-3 d-flex flex-wrap gap-3">
                          {galleryFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="position-relative"
                              style={{ width: 100, height: 100 }}
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`gallery-${idx}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  border: "1px solid #ddd",
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGalleryFiles((prev) =>
                                    prev.filter((_, i) => i !== idx)
                                  );
                                }}
                                style={{
                                  position: "absolute",
                                  top: -8,
                                  right: -8,
                                  background: "red",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: 22,
                                  height: 22,
                                  cursor: "pointer",
                                  fontSize: 12,
                                  lineHeight: "20px",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Col>

                    <Col md="12" className="mb-3">
                      <Label>
                        Short Intro <span className="text-danger">*</span>
                      </Label>
                      <Input
                        type="textarea"
                        name="shortinfo"
                        value={formData.shortinfo}
                        onChange={handleInput}
                        placeholder="Short Intro"
                        required
                      />
                      {errors.shortinfo && (
                        <span className="text-danger">{errors.shortinfo}</span>
                      )}
                    </Col>

                    <Col md="12" className="mb-3">
                      <Label>
                        Biography <span className="text-danger">*</span>
                      </Label>
                      <RichTextEditor
                        value={formData.biography}
                        height={400}
                        onChange={(data) =>
                          setFormData((prev) => ({
                            ...prev,
                            biography: data,
                          }))
                        }
                      />
                      {errors.biography && (
                        <span className="text-danger">{errors.biography}</span>
                      )}
                    </Col>

                    <Col md="6" className="mb-3">
                      <Label>
                        Professions <span className="text-danger">*</span>
                      </Label>
                      <Select
                        isMulti
                        name="professions"
                        options={professionsOptions}
                        value={professionsOptions.filter((opt) =>
                          formData.professions.includes(opt.value)
                        )}
                        onChange={(selectedOptions) =>
                          setFormData((prev) => ({
                            ...prev,
                            professions: selectedOptions.map((opt) => opt.value),
                          }))
                        }
                        placeholder="Choose..."
                        required
                      />
                      {errors.professions && (
                        <span className="text-danger">{errors.professions}</span>
                      )}
                    </Col>

                    <Col md="6" className="mb-3">
                      <Label>
                        Languages <span className="text-danger">*</span>
                      </Label>
                      <Select
                        isMulti
                        name="languages"
                        options={languagesOptions}
                        value={languagesOptions.filter((opt) =>
                          formData.languages.includes(opt.value)
                        )}
                        onChange={(selectedOptions) =>
                          setFormData((prev) => ({
                            ...prev,
                            languages: selectedOptions.map((opt) => opt.value),
                          }))
                        }
                        placeholder="Choose..."
                        required
                      />
                      {errors.languages && (
                        <span className="text-danger">{errors.languages}</span>
                      )}
                    </Col>

                    <Col md="6" className="mb-3">
                      <Label>
                        Status <span className="text-danger">*</span>
                      </Label>
                      <Input
                        type="select"
                        name="statusnew"
                        onChange={handleInput}
                        value={formData.statusnew}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Draft">Draft</option>
                        <option value="In Review">In Review</option>
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                      </Input>
                      {errors.statusnew && (
                        <span className="text-danger">{errors.statusnew}</span>
                      )}
                    </Col>

                    {/* SOCIAL LINKS */}
                    <Col md="12" className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Label>Social Links</Label>
                        <Button
                          color="primary"
                          size="sm"
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              socialLinks: [
                                ...prev.socialLinks,
                                { platform: "", customUrl: "" },
                              ],
                            }))
                          }
                        >
                          + Add Link
                        </Button>
                      </div>

                      {formData.socialLinks.length > 0 ? (
                        <div>
                          {formData.socialLinks.map((item, index) => {
                            const platformOption = socialLinksOptions.find(
                              (opt) => opt.value === item.platform
                            );
                            
                            const availableOptions = socialLinksOptions.filter(option => {
                              const isAlreadySelected = formData.socialLinks.some(
                                (link, idx) => idx !== index && link.platform === option.value
                              );
                              return !isAlreadySelected;
                            });
                            
                            return (
                              <div key={index} className="mb-3">
                                <Row className="g-2 align-items-start">
                                  <Col md="4">
                                    <Label className="small">Platform</Label>
                                    <Select
                                      options={availableOptions}
                                      value={platformOption}
                                      onChange={(selected) => {
                                        const updated = [...formData.socialLinks];
                                        updated[index].platform = selected.value;
                                        setFormData((prev) => ({
                                          ...prev,
                                          socialLinks: updated,
                                        }));
                                      }}
                                      placeholder="Select Platform"
                                    />
                                  </Col>

                                  <Col md="7">
                                    <Label className="small">URL</Label>
                                    <Input
                                      type="text"
                                      placeholder="e.g. www.facebook.com/johndoe"
                                      value={item.customUrl || ""}
                                      onChange={(e) => {
                                        const updated = [...formData.socialLinks];
                                        updated[index].customUrl = e.target.value;

                                        const urlValid = isValidSocialUrl(e.target.value);
                                        const newErrors = [...(errors.socialLinks || [])];
                                        newErrors[index] = urlValid
                                          ? ""
                                          : "Please enter a valid URL starting with www.";

                                        setErrors((prev) => ({
                                          ...prev,
                                          socialLinks: newErrors,
                                        }));
                                        setFormData((prev) => ({
                                          ...prev,
                                          socialLinks: updated,
                                        }));
                                      }}
                                    />
                                    {errors.socialLinks?.[index] && (
                                      <div className="text-danger small mt-1">
                                        {errors.socialLinks[index]}
                                      </div>
                                    )}
                                  </Col>

                                  <Col md="1" className="d-flex align-items-end">
                                    <Button
                                      color="danger"
                                      size="sm"
                                      type="button"
                                      onClick={() => {
                                        const updated = formData.socialLinks.filter(
                                          (_, i) => i !== index
                                        );
                                        const updatedErrors = (
                                          errors.socialLinks || []
                                        ).filter((_, i) => i !== index);
                                        setFormData((prev) => ({
                                          ...prev,
                                          socialLinks: updated,
                                        }));
                                        setErrors((prev) => ({
                                          ...prev,
                                          socialLinks: updatedErrors,
                                        }));
                                      }}
                                      style={{ marginTop: "24px" }}
                                    >
                                      ×
                                    </Button>
                                  </Col>
                                </Row>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center text-muted p-3 border rounded">
                          No social links added yet
                        </div>
                      )}
                    </Col>
                  </Row>

                  <Button type="submit" color="primary" className="mt-3">
                    Add Celebrity
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

export default AddCelebrityForm;