import { useState } from "react";
import { useToast } from "../../components/common/Toast";
import "./StaticPages.css";

function Contact() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      showToast("Please fill in all fields", "error");
      return;
    }

    // NOTE: there is no backend endpoint for contact form submissions yet.
    // This is a placeholder for a future /contact endpoint.
    setSubmitted(true);
    showToast("Message sent! We'll get back to you soon.", "success");
  };

  return (
    <div className="static-page">
      <div className="container static-content">
        <h1 className="static-title">Contact Us</h1>
        <p className="static-text">
          Have a question or feedback? Send us a message and our team will
          get back to you.
        </p>

        {submitted ? (
          <div className="contact-success">Thanks for reaching out! We'll respond shortly.</div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" value={formData.message} onChange={handleChange} />
            </div>

            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Contact;
