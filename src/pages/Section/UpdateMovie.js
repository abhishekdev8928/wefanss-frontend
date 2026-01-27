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
import Select from "react-select";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import {
  getMovievById,
  updateMoviev,
  getLanguageOptions,
  getGenreMaster,
} from "../../api/movievApi";

const UpdateMoviev = () => {
  const [breadcrumbItems] = useState([
    { title: "Dashboard", link: "#" },
    { title: "Update Moviev", link: "#" },
  ]);

  const navigate = useNavigate();
  const { id } = useParams(); // movie ID

  const [formData, setFormData] = useState({
    title: "",
    release_year: "",
    release_date: "",
    role: "",
    role_type: "",
    languages: [],
    director: "",
    producer: "",
    cast: "",
    notes: "",
    rating: "",
    genre: "",
    platform_rating: "",
    old_image: "", // for preview
    watchLinks: [], // ✅ Added
    awards: "",
    sort: "",
    statusnew: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [languagesOptions, setLanguageOptions] = useState([]);
  const [celebrityId, setCelebrityId] = useState("");
  const [optionscat, setOptions] = useState([]);

  // Fetch languages & movie data
  useEffect(() => {
    fetchLanguageOptions();
    fetchMovievById();
    fetchOptions();
  }, [id]);

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
  const fetchOptions = async () => {
    try {
      const res_data = await getGenreMaster();
      const options = Array.isArray(res_data.msg)
        ? res_data.msg.map((item) => ({
            value: item._id,
            label: item.name?.trim() || item.name,
          }))
        : [];
      setOptions(options);
    } catch (error) {
      console.error("Error fetching category options:", error);
    }
  };

  const fetchMovievById = async () => {
    try {
      const res = await getMovievById(id);
      if (res.msg) {
        const data = res.msg;
        setFormData({
          title: data.title || "",
          release_year: data.release_year || "",
          release_date: data.release_date || "",
          role: data.role || "",
          role_type: data.role_type || "",
          languages: data.languages || [],
          director: data.director || "",
          producer: data.producer || "",
          cast: data.cast || "",
          notes: data.notes || "",
          rating: data.rating || "",
          awards: data.awards || "",
          sort: data.sort || "",
          genre: data.genre || "",
          statusnew: data.statusnew || "",
          platform_rating: data.platform_rating || "",
          watchLinks: data.watchLinks || [], // ✅ load watchLinks
          old_image: data.image || "",
        });
        setCelebrityId(data.celebrityId);
      } else {
        toast.error("Movie not found");
      }
    } catch (err) {
      console.error("Fetch Moviev Error:", err);
      toast.error("Failed to fetch movie data");
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };
  // ✅ Watch Links functions
  const handleAddWatchLink = () => {
    setFormData((prev) => ({
      ...prev,
      watchLinks: [...prev.watchLinks, { platform: "", url: "", type: "" }],
    }));
  };

  const handleRemoveWatchLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      watchLinks: prev.watchLinks.filter((_, i) => i !== index),
    }));
  };

  const handleWatchLinkChange = (index, field, value) => {
    const updated = [...formData.watchLinks];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, watchLinks: updated }));
  };
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.release_year)
      newErrors.release_year = "Release year is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        // ✅ Skip arrays — we'll handle them separately
        if (!["old_image", "watchLinks", "languages"].includes(key)) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // ✅ Properly stringify arrays
      formDataToSend.append("languages", JSON.stringify(formData.languages));
      formDataToSend.append("watchLinks", JSON.stringify(formData.watchLinks));

      if (selectedFile) formDataToSend.append("image", selectedFile);

      const adminid = localStorage.getItem("adminid");
      formDataToSend.append("updatedBy", adminid);

      // 🧠 Debug Log — check before sending
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      const result = await updateMoviev(id, formDataToSend);

      if (!result.status) {
        toast.error(result.msg || "Failed to update movie.");
        return;
      }

      toast.success("Movie updated successfully!");
      navigate(`/dashboard/list-movie/${celebrityId}`);
    } catch (err) {
      console.error("Update Movie Error:", err);
      toast.error("Something went wrong while updating the movie.");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="UPDATE Moviev" breadcrumbItems={breadcrumbItems} />
        <Row>
          <Col xl="12">
            <Card>
              <CardBody>
                <form onSubmit={handleUpdateSubmit}>
                  <Row>
                    <Col md="6">
                      <Label>Title</Label>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInput}
                        placeholder="Title"
                        type="text"
                      />
                      {errors.title && (
                        <span className="text-danger">{errors.title}</span>
                      )}
                    </Col>
                    <Col md="6">
                      <div className="mb-3">
                        <Label className="form-label">Select Genre </Label>
                        <Select
                          options={optionscat}
                          name="genre"
                          value={
                            optionscat.find(
                              (option) => option.value === formData.genre
                            ) || null
                          }
                          onChange={(selectedOption) => {
                            setFormData((prev) => ({
                              ...prev,
                              genre: selectedOption ? selectedOption.value : "",
                              name: selectedOption ? selectedOption.label : "",
                            }));
                          }}
                          isClearable
                          placeholder="Select Genre..."
                        />
                        {errors.genre && (
                          <span className="text-danger">{errors.genre}</span>
                        )}
                      </div>
                    </Col>

                    <Col md="6">
                      <Label>Release Year</Label>
                      <Input
                        name="release_year"
                        value={formData.release_year}
                        onChange={handleInput}
                        placeholder="Release Year"
                        type="number"
                      />
                      {errors.release_year && (
                        <span className="text-danger">
                          {errors.release_year}
                        </span>
                      )}
                    </Col>
                    <Col md="6">
                      <Label>Release Date</Label>
                      <Input
                        name="release_date"
                        value={formData.release_date}
                        onChange={handleInput}
                        placeholder="Release Date"
                        type="date"
                      />
                    </Col>
                    <Col md="6">
                      <Label>Role / Character Name</Label>
                      <Input
                        name="role"
                        value={formData.role}
                        onChange={handleInput}
                        placeholder="Role / Character Name"
                        type="text"
                      />
                    </Col>
                    <Col md="6">
                      <Label>Role Type</Label>
                      <Input
                        type="select"
                        name="role_type"
                        value={formData.role_type}
                        onChange={handleInput}
                      >
                        <option value="">Select</option>
                        <option value="Lead">Lead</option>
                        <option value="Supporting">Supporting</option>
                        <option value="Cameo">Cameo</option>
                        <option value="Special Appearance">
                          Special Appearance
                        </option>
                        <option value="Voice">Voice</option>
                      </Input>
                    </Col>
                    <Col md="6">
                      <Label>Languages</Label>
                      <Select
                        isMulti
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
                      />
                    </Col>
                    <Col md="6">
                      <Label>Director</Label>
                      <Input
                        name="director"
                        value={formData.director}
                        onChange={handleInput}
                        placeholder="Director"
                        type="text"
                      />
                    </Col>
                    <Col md="6">
                      <Label>Producer</Label>
                      <Input
                        name="producer"
                        value={formData.producer}
                        onChange={handleInput}
                        placeholder="Producer / Production House"
                        type="text"
                      />
                    </Col>
                    <Col md="6">
                      <Label>Cast</Label>
                      <Input
                        name="cast"
                        value={formData.cast}
                        onChange={handleInput}
                        placeholder="Cast"
                        type="text"
                      />
                    </Col>
                    <Col md="12">
                      <Label>Synopsis / Notes</Label>
                      <Input
                        type="textarea"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInput}
                        placeholder="Synopsis / Notes"
                      />
                    </Col>
                    <Col md="6">
                      <Label>Poster / Thumbnail</Label>
                      <Input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {formData.old_image && (
                        <div className="mt-2">
                          <img
                            src={`${process.env.REACT_APP_API_BASE_URL}/moviev/${formData.old_image}`}
                            alt="Poster"
                            width="100"
                            className="rounded border"
                          />
                        </div>
                      )}
                    </Col>
                    <Col md="6">
                      <Label>IMDB Rating</Label>
                      <Input
                        name="rating"
                        value={formData.rating}
                        onChange={handleInput}
                        placeholder="IMDB Rating"
                        type="number"
                      />
                    </Col>
                    <Col md="6">
                      <Label>Your Platform Rating</Label>
                      <Input
                        name="platform_rating"
                        value={formData.platform_rating}
                        onChange={handleInput}
                        placeholder="Platform Rating"
                        type="number"
                      />
                    </Col>
                    <Col md="6">
                      <Label>Awards / Nominations (for this movie) </Label>
                      <Input
                        name="awards"
                        value={formData.awards}
                        onChange={handleInput}
                        placeholder="Awards / Nominations (for this movie) "
                        type="text"
                      />
                    </Col>
                    <Col md="6">
                      <Label>Sort Order </Label>
                      <Input
                        name="sort"
                        value={formData.sort}
                        onChange={handleInput}
                        placeholder="Sort Order"
                        type="number"
                      />
                    </Col>

                    <Col md="6">
                      <Label>Status </Label>
                      <Input
                        type="select"
                        name="statusnew"
                        onChange={handleInput}
                        value={formData.statusnew}
                      >
                        <option value="">Select</option>
                        <option value="Draft">Draft </option>
                        <option value="Published">Published </option>
                      </Input>
                    </Col>
                    {/* ✅ Watch Links Section */}
                    <Col md="12" className="mt-4">
                      <h5>Watch Links</h5>
                      {formData.watchLinks.map((link, index) => (
                        <Row key={index} className="align-items-center mb-2">
                          <Col md="3">
                            <Label>Platform</Label>
                            <Input
                              value={link.platform}
                              onChange={(e) =>
                                handleWatchLinkChange(
                                  index,
                                  "platform",
                                  e.target.value
                                )
                              }
                              placeholder="Netflix"
                            />
                          </Col>
                          <Col md="5">
                            <Label>URL</Label>
                            <Input
                              type="url"
                              value={link.url}
                              onChange={(e) =>
                                handleWatchLinkChange(
                                  index,
                                  "url",
                                  e.target.value
                                )
                              }
                              placeholder="https://..."
                            />
                          </Col>
                          <Col md="3">
                            <Label>Type</Label>
                            <Input
                              type="select"
                              value={link.type}
                              onChange={(e) =>
                                handleWatchLinkChange(
                                  index,
                                  "type",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select</option>
                              <option value="OTT">OTT</option>
                              <option value="Trailer">Trailer</option>
                              <option value="Song">Song</option>
                              <option value="Clip">Clip</option>
                            </Input>
                          </Col>
                          <Col md="1" className="d-flex align-items-end">
                            <Button
                              color="danger"
                              type="button"
                              onClick={() => handleRemoveWatchLink(index)}
                            >
                              ×
                            </Button>
                          </Col>
                        </Row>
                      ))}
                      <Button
                        type="button"
                        color="secondary"
                        onClick={handleAddWatchLink}
                      >
                        + Add Watch Link
                      </Button>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <Button type="submit" color="primary">
                      Update Moviev
                    </Button>
                    <Button
                      type="button"
                      color="secondary"
                      onClick={() => navigate(`/list-movie/${celebrityId}`)}
                    >
                      ← Back
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UpdateMoviev;
