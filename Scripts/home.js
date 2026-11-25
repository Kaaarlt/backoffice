import {
  requireAuth,
  logout,
  getUser,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "./api.js";

if (requireAuth()) {
  document.querySelector("main").hidden = false;
  init();
}

function init() {
  const panel = document.getElementById("projects");
  const template = document.getElementById("project-template");
  const empty = document.getElementById("empty");
  const message = document.getElementById("message");
  const addButton = document.getElementById("add-project");
  const logoutButton = document.getElementById("logout");
  const formSection = document.getElementById("form-section");
  const formTitle = document.getElementById("form-title");
  const form = document.getElementById("project-form");
  const cancelButton = document.getElementById("cancel-form");

  let editingId = null;

  const parseList = (value) =>
    value.split(",").map((item) => item.trim()).filter(Boolean);

  function showError(error) {
    message.textContent = error.message;
  }

  function openForm(project = null) {
    editingId = project ? project._id ?? project.id : null;
    formTitle.textContent = project ? "Actualizar proyecto" : "Agregar proyecto";
    form.elements.title.value = project?.title ?? "";
    form.elements.description.value = project?.description ?? "";
    form.elements.technologies.value = project?.technologies?.join(", ") ?? "";
    form.elements.repository.value = project?.repository ?? "";
    form.elements.images.value = project?.images?.join(", ") ?? "";
    formSection.hidden = false;
    form.elements.title.focus();
  }

  function closeForm() {
    form.reset();
    editingId = null;
    formSection.hidden = true;
  }

  function renderProjects(projects) {
    panel.replaceChildren();
    empty.hidden = projects.length > 0;

    projects.forEach((project) => {
      const id = project._id ?? project.id;
      const card = template.content.cloneNode(true);

      card.querySelector(".project__title").textContent = project.title;
      card.querySelector(".project__description").textContent = project.description;

      const technologies = card.querySelector(".project__technologies");
      if (project.technologies?.length) {
        technologies.textContent = project.technologies.join(", ");
      } else {
        technologies.hidden = true;
      }

      const repository = card.querySelector(".project__repository");
      if (project.repository) {
        repository.href = project.repository;
      } else {
        repository.hidden = true;
      }

      const image = card.querySelector(".project__image");
      if (project.images?.length) {
        image.src = project.images[0];
        image.alt = project.title;
        image.addEventListener("error", () => (image.hidden = true));
      } else {
        image.hidden = true;
      }

      card.querySelector(".project__edit").addEventListener("click", async () => {
        message.textContent = "";
        try {
          openForm(await getProjectById(id));
        } catch (error) {
          showError(error);
        }
      });

      card.querySelector(".project__delete").addEventListener("click", async () => {
        if (!confirm("¿Eliminar este proyecto?")) return;
        message.textContent = "";
        try {
          await deleteProject(id);
          await loadProjects();
        } catch (error) {
          showError(error);
        }
      });

      panel.append(card);
    });
  }

  async function loadProjects() {
    try {
      renderProjects(await getProjects());
    } catch (error) {
      showError(error);
    }
  }

  addButton.addEventListener("click", () => {
    message.textContent = "";
    openForm();
  });

  logoutButton.addEventListener("click", logout);

  cancelButton.addEventListener("click", closeForm);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;

    const project = {
      title: form.elements.title.value.trim(),
      description: form.elements.description.value.trim(),
      userId: getUser()?.id,
      technologies: parseList(form.elements.technologies.value),
      images: parseList(form.elements.images.value),
    };
    const repository = form.elements.repository.value.trim();
    if (repository) project.repository = repository;

    try {
      if (editingId) {
        await updateProject(editingId, project);
      } else {
        await createProject(project);
      }
      closeForm();
      await loadProjects();
    } catch (error) {
      showError(error);
    } finally {
      submitButton.disabled = false;
    }
  });

  loadProjects();
}