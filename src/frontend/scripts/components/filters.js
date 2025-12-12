import { exifDescriptions, commonExifProps } from '../core/constants.js';

export let selectedProps = new Set();
export let expandedCategories = new Set(['common', 'advanced', 'other']);

export function loadUserPreferences() {
  const savedProps = localStorage.getItem('selectedProps');
  const savedCategories = localStorage.getItem('expandedCategories');
  if (savedProps) selectedProps = new Set(JSON.parse(savedProps));
  else commonExifProps.forEach(prop => selectedProps.add(prop));
  if (savedCategories) expandedCategories = new Set(JSON.parse(savedCategories));
  else expandedCategories = new Set(['common', 'advanced', 'other']);
}

export function saveUserPreferences() {
  localStorage.setItem('selectedProps', JSON.stringify(Array.from(selectedProps)));
  localStorage.setItem('expandedCategories', JSON.stringify(Array.from(expandedCategories)));
}

export function updateSelectedCount() {
  const countElement = document.getElementById('selected-prop-count');
  if (countElement) countElement.textContent = selectedProps.size;
}

export function updateCategoryCounts() {
  const categories = ['common', 'advanced', 'other'];
  categories.forEach(category => {
    const categoryItems = document.querySelectorAll(`.category-item[data-category="${category}"]`);
    const countElement = document.querySelector(`.category-main[data-category="${category}"]`).closest('.category-header').querySelector('.category-count');
    if (countElement) countElement.textContent = `(${categoryItems.length})`;
  });
}

export function expandAllCategories() {
  document.querySelectorAll('.category-group').forEach(group => {
    const items = group.querySelector('.category-items');
    const toggle = group.querySelector('.category-toggle');
    const main = group.querySelector('.category-main');
    if (items) items.classList.add('show');
    if (toggle) { toggle.classList.add('expanded'); toggle.textContent = '▼'; }
    const category = main && main.dataset.category;
    if (category) expandedCategories.add(category);
  });
  saveUserPreferences();
}

export function collapseAllCategories() {
  document.querySelectorAll('.category-group').forEach(group => {
    const items = group.querySelector('.category-items');
    const toggle = group.querySelector('.category-toggle');
    const main = group.querySelector('.category-main');
    if (items) items.classList.remove('show');
    if (toggle) { toggle.classList.remove('expanded'); toggle.textContent = '▶'; }
    const category = main && main.dataset.category;
    if (category) expandedCategories.delete(category);
  });
  saveUserPreferences();
}

export function initializeCategoryState() {
  const categories = ['common', 'advanced', 'other'];
  categories.forEach(category => {
    const mainCheckbox = document.querySelector(`.category-main[data-category="${category}"]`);
    if (!mainCheckbox) return;
    const categoryGroup = mainCheckbox.closest('.category-group');
    const categoryItems = categoryGroup.querySelector('.category-items');
    const toggle = mainCheckbox.closest('.category-header').querySelector('.category-toggle');
    if (categoryItems && toggle) {
      categoryItems.classList.add('show');
      toggle.classList.add('expanded');
      toggle.textContent = '▼';
      expandedCategories.add(category);
    }
  });
  document.querySelectorAll('.category-item').forEach(item => {
    const prop = item.dataset.prop;
    item.checked = selectedProps.has(prop);
  });
  document.querySelectorAll('.category-group').forEach(group => {
    const mainCheckbox = group.querySelector('.category-main');
    const categoryItems = group.querySelectorAll('.category-item');
    if (categoryItems.length > 0) {
      const allChecked = Array.from(categoryItems).every(item => item.checked);
      const anyChecked = Array.from(categoryItems).some(item => item.checked);
      mainCheckbox.checked = allChecked;
      mainCheckbox.indeterminate = anyChecked && !allChecked;
    }
  });
  updateSelectedCount();
}

export function setupCategoryFilters() {
  loadUserPreferences();
  initializeCategoryState();
  updateCategoryCounts();
  document.querySelectorAll('.category-group .category-header').forEach(header => {
    header.addEventListener('click', function(e) {
      if (e.target.type === 'checkbox') return;
      const categoryGroup = this.closest('.category-group');
      const categoryItems = categoryGroup.querySelector('.category-items');
      if (!categoryItems) return;
      const toggle = this.querySelector('.category-toggle');
      const category = this.querySelector('.category-main').dataset.category;
      categoryItems.classList.toggle('show');
      toggle.classList.toggle('expanded');
      if (categoryItems.classList.contains('show')) expandedCategories.add(category);
      else expandedCategories.delete(category);
      toggle.textContent = toggle.textContent === '▶' ? '▼' : '▶';
      saveUserPreferences();
    });
  });
  document.querySelectorAll('.category-group .category-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const header = this.closest('.category-header');
      const categoryGroup = header.closest('.category-group');
      const categoryItems = categoryGroup.querySelector('.category-items');
      if (!categoryItems) return;
      const category = header.querySelector('.category-main').dataset.category;
      categoryItems.classList.toggle('show');
      toggle.classList.toggle('expanded');
      if (categoryItems.classList.contains('show')) expandedCategories.add(category);
      else expandedCategories.delete(category);
      toggle.textContent = toggle.textContent === '▶' ? '▼' : '▶';
      saveUserPreferences();
    });
  });
  const allPropertiesCheckbox = document.getElementById('all-properties');
  allPropertiesCheckbox.addEventListener('change', function() {
    const isChecked = this.checked;
    const allCategoryCheckboxes = document.querySelectorAll('.category-group .category-main:not(#all-properties)');
    const allItemCheckboxes = document.querySelectorAll('.category-item');
    allCategoryCheckboxes.forEach(checkbox => { checkbox.checked = isChecked; checkbox.disabled = isChecked; });
    allItemCheckboxes.forEach(checkbox => { checkbox.checked = isChecked; checkbox.disabled = isChecked; });
    if (isChecked) {
      selectedProps.clear();
      allItemCheckboxes.forEach(checkbox => { selectedProps.add(checkbox.dataset.prop); });
    } else {
      selectedProps.clear();
      allCategoryCheckboxes.forEach(checkbox => { checkbox.disabled = false; });
      allItemCheckboxes.forEach(checkbox => { checkbox.disabled = false; });
    }
    saveUserPreferences();
    updateSelectedCount();
  });
  document.querySelectorAll('.category-group .category-main:not(#all-properties)').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (allPropertiesCheckbox.checked) return;
      const categoryGroup = this.closest('.category-group');
      const categoryItems = categoryGroup.querySelectorAll('.category-item');
      const isChecked = this.checked;
      categoryItems.forEach(item => {
        item.checked = isChecked;
        if (isChecked) selectedProps.add(item.dataset.prop);
        else selectedProps.delete(item.dataset.prop);
      });
      saveUserPreferences();
      updateSelectedCount();
    });
  });
  document.querySelectorAll('.category-item').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (allPropertiesCheckbox.checked) return;
      const prop = this.dataset.prop;
      const categoryGroup = this.closest('.category-group');
      const mainCheckbox = categoryGroup.querySelector('.category-main');
      const categoryItems = categoryGroup.querySelectorAll('.category-item');
      if (this.checked) selectedProps.add(prop);
      else selectedProps.delete(prop);
      const allChecked = Array.from(categoryItems).every(item => item.checked);
      const anyChecked = Array.from(categoryItems).some(item => item.checked);
      mainCheckbox.checked = allChecked;
      mainCheckbox.indeterminate = anyChecked && !allChecked;
      saveUserPreferences();
      updateSelectedCount();
    });
  });
}
