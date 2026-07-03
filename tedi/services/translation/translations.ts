import { Language } from "./translation.service";

export const translationsMap = {
  close: {
    description: "Used for closing",
    components: [
      "Accordion",
      "CloseButton",
      "Collapse",
      "Notification",
      "FileUpload",
      "Dropdown",
      "Tooltip",
      "HeaderRole",
    ],
    et: "Sulge",
    en: "Close",
    ru: "Закрыть",
  },
  open: {
    description: "Used for opening",
    components: ["Accordion", "Collapse", "TableOfContents"],
    et: "Ava",
    en: "Open",
    ru: "Открыть",
  },
  remove: {
    description: "Used for removing",
    components: ["FileUpload", "Tag"],
    et: "Eemalda",
    en: "Remove",
    ru: "Удалить",
  },
  cancel: {
    description: "For canceling an action",
    components: ["TableFilter"],
    et: "Tühista",
    en: "Cancel",
    ru: "Отмена",
  },
  clear: {
    description: "For clearing a value",
    components: ["TableFilter", "TextField", "Select"],
    et: "Tühjenda",
    en: "Clear",
    ru: "Очистить",
  },
  search: {
    description: "For searching",
    components: ["TableFilter"],
    et: "Otsi",
    en: "Search",
    ru: "Поиск",
  },
  required: {
    description: "Required field",
    components: ["TableFilter"],
    et: "Kohustuslik väli",
    en: "Required field",
    ru: "Обязательное поле",
  },
  breadcrumbs: {
    description: "Breadcrumbs navigation label",
    components: ["Breadcrumbs"],
    et: "Jäljerida",
    en: "Breadcrumbs",
    ru: "Навигационная цепочка",
  },
  "breadcrumbs.show-more": {
    description: "Label for the collapsed-crumbs ellipsis button in breadcrumbs",
    components: ["Breadcrumbs"],
    et: "Näita rohkem",
    en: "Show more",
    ru: "Показать больше",
  },
  more: {
    components: ["Tabs"],
    et: "Veel",
    en: "More",
    ru: "Более",
  },
  "anchor.new-tab": {
    description: "Label for when anchor opens in new tab",
    components: ["Anchor"],
    et: "Avaneb uuel vahelehel",
    en: "Opens in new tab",
    ru: "Открывается в новой вкладке",
  },
  "header.toggle": {
    description: "Label for header toggle on mobile",
    components: ["Header"],
    et: (isOpen: boolean) => (isOpen ? "Sulge menüü" : "Ava menüü"),
    en: (isOpen: boolean) => (isOpen ? "Close menu" : "Open menu"),
    ru: (isOpen: boolean) => (isOpen ? "Закрыть меню" : "Открыть меню"),
  },
  "header.settings": {
    description: "Label for HeaderSettings Button",
    components: ["HeaderSettings"],
    et: "Seaded",
    en: "Settings",
    ru: "Настройки",
  },
  "header.select-lang": {
    description: "Label for HeaderLanguage label and Modal Heading",
    components: ["HeaderLanguage"],
    et: "Keel:",
    en: "Language:",
    ru: "Язык:",
  },
  "header.role-label": {
    description: "Label for Role selection",
    components: ["HeaderRole"],
    et: "Mina esindan:",
    en: "I represent:",
    ru: "я представляю:",
  },
  "header.role-switch": {
    description: "Label for role switch button",
    components: ["HeaderRole"],
    et: "Roll",
    en: "Role",
    ru: "Роль",
  },
  "header.role-search": {
    description: "Label for Role search input",
    components: ["HeaderRole"],
    et: "Otsi isikut",
    en: "Search representative",
    ru: "Найти представителя",
  },
  "header.role-search.organization": {
    description: "Label for Role search input when searching for organizations",
    components: ["HeaderRole"],
    et: "Otsi asutust",
    en: "Search organization",
    ru: "Найти организацию",
  },
  "header.role-no-representatives": {
    description: "Text shown when representative search yields no results",
    components: ["HeaderRole"],
    et: "Esindatavaid ei leitud",
    en: "No representatives found",
    ru: "Представители не найдены",
  },
  "header.login": {
    description: "Label for login button",
    components: ["HeaderLogin"],
    et: "Sisene portaali",
    en: "Log in",
    ru: "Зайти на портал",
  },
  "header.login.mobile": {
    description: "Label for login button in mobile view",
    components: ["HeaderLogin"],
    et: "Sisene",
    en: "Log in",
    ru: "Войти",
  },
  "header.logout": {
    description: "Label for logout button",
    components: ["HeaderLogout"],
    et: "Logi välja",
    en: "Log out",
    ru: "Выйти",
  },
  "header.logout.mobile": {
    description: "Label for logout button (small)",
    components: ["HeaderLogout"],
    et: "Välju",
    en: "Log out",
    ru: "Выйти",
  },
  "header.logo": {
    description: "Alt Label for logo",
    components: ["Header"],
    et: "Logo",
    en: "Logo",
    ru: "Логотип",
  },
  "header.profile": {
    description: "Label for profile button",
    components: ["HeaderProfile"],
    et: "Minu profiil",
    en: "My profile",
    ru: "Мой профиль",
  },
  "header.profile.mobile": {
    description: "Label for profile button on mobile",
    components: ["HeaderProfile"],
    et: "Profiil",
    en: "Profile",
    ru: "Профиль",
  },
  "header.search": {
    description: "Label for search button",
    components: ["HeaderSearch"],
    et: "Otsing",
    en: "Search",
    ru: "Поиск",
  },
  "file-upload.add": {
    description: "Label for add file button",
    components: ["FileUpload"],
    et: "Lisa manus",
    en: "Add attachment",
    ru: "Загрузить файл",
  },
  "file-upload.accept": {
    description: "Default label for file extensions",
    components: ["FileUpload"],
    et: "Lubatud faililaiendid:",
    en: "Allowed file extensions:",
    ru: "Разрешенные расширения файлов:",
  },
  "file-upload.max-size": {
    description: "Default label for file size restriction",
    components: ["FileUpload"],
    et: "Maksimaalne suurus:",
    en: "Maximum size:",
    ru: "Максимальный размер:",
  },
  "file-upload.size-rejected": {
    description: "Error label for rejected size",
    components: ["FileUpload"],
    et: (files: string) => `Fail(id) ${files} on liiga suured`,
    en: (files: string) => `File(s) ${files} are too large`,
    ru: (files: string) => `Файл(ы) ${files} слишком велики`,
  },
  "file-upload.size-rejected-extended": {
    description: "Error label for rejected size",
    components: ["FileUpload"],
    et: (files: string, maxSize: string) =>
      `Fail ${files} on liiga suur. Maksimaalne suurus: ${maxSize}`,
    en: (files: string, maxSize: string) =>
      `File ${files} is too large. Maximum size: ${maxSize}`,
    ru: (files: string, maxSize: string) =>
      `Файл ${files} слишком велик. Максимальный размер: ${maxSize}`,
  },
  "file-upload.drag-and-drop": {
    description: "Text shown when dragging files over the dropzone",
    components: ["FileUpload"],
    et: "Fail(id) tuvastatud, lohista üleslaadimiseks",
    en: "File detected, drop to upload",
    ru: "Файл обнаружен, отпустите для загрузки",
  },
  "file-upload.extension-rejected": {
    description: "Error label for rejected extension",
    components: ["FileUpload"],
    et: (files: string) => `Fail(id) ${files} on vale laiendiga`,
    en: (files: string) => `File(s) ${files} have the wrong extension`,
    ru: (files: string) => `Файл(ы) ${files} имеют неправильное расширение`,
  },
  "file-upload.extension-rejected-extended": {
    description: "Error label for rejected extension",
    components: ["FileUpload"],
    et: (files: string, validTypes: string) =>
      `Fail(id) ${files} on vale laiendiga. Lubatud laiendid: ${validTypes}`,
    en: (files: string, validTypes: string) =>
      `File(s) ${files} have the wrong extension. Allowed extensions: ${validTypes}`,
    ru: (files: string, validTypes: string) =>
      `Файл(ы) ${files} имеют неправильное расширение. Разрешенные расширения: ${validTypes}`,
  },
  "file-dropzone.label": {
    description: "Default label for dropzone",
    components: ["FileDropzone"],
    et: "Lohista failid siia või klõpsa, et sirvida",
    en: "Drop files here, or click to browse",
    ru: "Перетащите файлы сюда или нажмите, чтобы выбрать",
  },
  "file-dropzone.error": {
    description: "Error label for dropzone",
    components: ["FileDropzone"],
    et: "Faili üleslaadimisel tekkis viga",
    en: "An error occurred while uploading the file",
    ru: "Произошла ошибка при загрузке файла",
  },
  "file-attachment.uploading": {
    description: "Default hint label shown under the progress bar in Attachment while a file is being uploaded",
    components: ["Attachment"],
    et: "Üleslaadimine",
    en: "Uploading",
    ru: "Загрузка",
  },
  "modal.close": {
    description: "Label for modals close button",
    components: ["Modal"],
    et: "Sulge modaal",
    en: "Close modal",
    ru: "Закрыть модальное окно",
  },
  "select.loading": {
    description: "Text when select options are loading",
    components: ["Select"],
    et: "Laadimine...",
    en: "Loading...",
    ru: "Загрузка...",
  },
  "select.no-options": {
    description: "Text when select has no options",
    components: ["Select"],
    et: "Valikud puuduvad",
    en: "No options",
    ru: "Нет вариантов",
  },
  "select.select-all": {
    description: "Text when select has 'select all' option",
    components: ["Select"],
    et: "Vali kõik",
    en: "Select all",
    ru: "Выбрать все",
  },
  "select.search": {
    description: "Placeholder text for search input in searchable select",
    components: ["Select"],
    et: "Otsi...",
    en: "Search...",
    ru: "Искать...",
  },
  "stepper.completed": {
    description:
      "Label for screen-reader that this step is completed (visually hidden)",
    components: ["StepperNav"],
    et: "Lõpetatud",
    en: "Completed",
    ru: "Завершено",
  },
  "stepper.not-completed": {
    description:
      "Label for screen-reader that this step is not completed (visually hidden)",
    components: ["StepperNav"],
    et: "Lõpetamata",
    en: "Not completed",
    ru: "Не завершено",
  },
  "stepper.error": {
    description:
      "Label for screen-reader that this step has errors (visually hidden)",
    components: ["HorizontalStepper"],
    et: "Viga",
    en: "Error",
    ru: "Ошибка",
  },
  "skeleton.loading": {
    description: "Announced by screen-readers when skeleton is loading",
    components: ["Skeleton"],
    et: "Laadimine",
    en: "Loading",
    ru: "Загрузка",
  },
  "skeleton.loading-completed": {
    description:
      "Announced by screen-readers when skeleton has completed loading",
    components: ["Skeleton"],
    et: "Laadimine lõpetatud",
    en: "Loading completed",
    ru: "Загрузка завершена",
  },
  "spinner.loading": {
    description: "Announced by screen-readers when spinner is loading",
    components: ["Spinner"],
    et: "Laadimine",
    en: "Loading",
    ru: "Загрузка",
  },
  "table.loading": {
    description: "Shown when table is loading",
    components: ["Table"],
    et: "Tabel laeb",
    en: "Table is loading",
    ru: "Таблица загружается",
  },
  "table.empty": {
    description: "Shown when table is empty",
    components: ["Table"],
    et: "Tulemused puuduvad",
    en: "No results",
    ru: "Нет результатов",
  },
  "table.error": {
    description: "Shown when table is in error state",
    components: ["Table"],
    et: "Tabeli andmete pärimisel tekkis viga",
    en: "An error occurred while retrieving table data",
    ru: "Произошла ошибка при получении данных таблицы",
  },
  "table.filter": {
    description: "Label for filter toggle",
    components: ["Table", "TableFilter"],
    et: "Filtreeri",
    en: "Filter",
    ru: "Фильтровать",
  },
  "table.filter.select-all": {
    description: "Label for selecting all",
    components: ["Table", "TableFilter"],
    et: "Vali kõik",
    en: "Select all",
    ru: "Выбрать все",
  },
  "table.filter.remove-all": {
    description: "Label for removing all",
    components: ["Table", "TableFilter"],
    et: "Eemalda kõik",
    en: "Remove all",
    ru: "Удалить все",
  },
  "filter.clear-selection": {
    description: "Label for the clear-selection action in the Filter dropdown",
    components: ["Filter"],
    et: "Tühjenda valik",
    en: "Clear selection",
    ru: "Очистить выбор",
  },
  "table.filter.no-options": {
    description: "When select filter has no options",
    components: ["Table", "TableFilter"],
    et: "Valikud puuduvad",
    en: "No options",
    ru: "Нет вариантов",
  },
  "table.filter.validation.no-spaces": {
    description: "Filter validation error - Text can not start with spaces",
    components: ["Table", "TableFilter"],
    et: "Tekst ei tohi alata tühikutega",
    en: "Filter text cant start with spaces",
    ru: "Текст фильтра не может начинаться с пробелов",
  },
  "table.filter.validation.min-length": {
    description: "Filter validation error - Text is too short",
    components: ["Table", "TableFilter"],
    et: (count: number) =>
      count === 1
        ? `Sisesta vähemalt ${count} tähemärk`
        : `Sisesta vähemalt ${count} tähemärki`,
    en: (count: number) =>
      count === 1
        ? `Min length is ${count} char`
        : `Min length is ${count} chars`,
    ru: (count: number) =>
      count === 1
        ? `Минимальная длина ${count} знак`
        : `Минимальная длина ${count} знаков`,
  },
  "table.filter.validation.to-before-from": {
    description: "Filter validation error - End date is before start date",
    components: ["Table", "TableFilter"],
    et: "Lõppkuupäev on enne alguskuupäeva",
    en: "End date must be after start date",
    ru: "Дата окончания предшествует дате начала",
  },
  "table.filter.from": {
    description: "Label for date filter from",
    components: ["Table", "TableFilter"],
    et: "Kuupäev alates",
    en: "Date from",
    ru: "Дата с",
  },
  "table.filter.to": {
    description: "Label for date filter until",
    components: ["Table", "TableFilter"],
    et: "Kuupäev kuni",
    en: "Date until",
    ru: "Дата до",
  },
  "table.toggle-sub-row": {
    description: "Toggle sub row button (Visually hidden)",
    components: ["Table"],
    et: (isExpaned: boolean) => (isExpaned ? "Sulge alamrida" : "Ava alamrida"),
    en: (isExpaned: boolean) => (isExpaned ? "Close subrow" : "Open subrow"),
    ru: (isExpaned: boolean) =>
      isExpaned ? "Закрыть подстроку" : "Открыть подстроку",
  },
  "table.select-all": {
    description: "Row selection - Label for check in table header",
    components: ["Table"],
    et: (isSelected: boolean) => (isSelected ? "Eemalda kõik" : "Vali kõik"),
    en: (isSelected: boolean) => (isSelected ? "Deselect all" : "Select all"),
    ru: (isSelected: boolean) =>
      isSelected ? "Убрать выделение со всего" : "Выбрать все",
  },
  "table.select-row": {
    description: "Row selection - Label for check in table row",
    components: ["Table"],
    et: (isSelected: boolean) => (isSelected ? "Eemalda rida" : "Vali rida"),
    en: (isSelected: boolean) => (isSelected ? "Deselect row" : "Select row"),
    ru: (isSelected: boolean) =>
      isSelected ? "Отменить выбор строки" : "Выбрать ряд",
  },
  "table.sort": {
    description: "Label for sort button",
    components: ["Table"],
    et: (direction: "asc" | "desc" | false) =>
      direction === "asc"
        ? "Sorteeri kahanevalt"
        : direction === "desc"
          ? "Eemalda sorteerimine"
          : "Sorteeri kasvavalt",
    en: (direction: "asc" | "desc" | false) =>
      direction === "asc"
        ? "Sort decending"
        : direction === "desc"
          ? "Remove sorting"
          : "Sort ascending",
    ru: (direction: "asc" | "desc" | false) =>
      direction === "asc"
        ? "Сортировать по убыванию"
        : direction === "desc"
          ? "Отменить сортировку"
          : "Сортировать по возрастанию",
  },
  "table.no-data": {
    description: "Default placeholder when table data is empty",
    components: ["Table"],
    et: "Andmed puuduvad",
    en: "No data",
    ru: "Нет данных",
  },
  "table.row-details": {
    description: "Accessible label for the expanded row details region",
    components: ["Table"],
    et: "Rea üksikasjad",
    en: "Row details",
    ru: "Подробности строки",
  },
  "table.filter-input": {
    description: "Accessible label for a column filter input",
    components: ["Table"],
    et: (column: string) => `Filtreeri ${column}`,
    en: (column: string) => `Filter ${column}`,
    ru: (column: string) => `Фильтр ${column}`,
  },
  "table.filter-placeholder": {
    description: "Placeholder shown in a column filter input",
    components: ["Table"],
    et: "Filtreeri…",
    en: "Filter…",
    ru: "Фильтр…",
  },
  "table.filter-apply": {
    description:
      "Apply action in the built-in column filter popover footer",
    components: ["Table"],
    et: "Filtreeri",
    en: "Apply",
    ru: "Применить",
  },
  "table.filter-clear": {
    description:
      "Clear action in the built-in column filter popover footer",
    components: ["Table"],
    et: "Tühista",
    en: "Clear",
    ru: "Сбросить",
  },
  "table.filter-button-aria": {
    description:
      "Accessible label of the built-in column filter trigger button",
    components: ["Table"],
    et: (column: string) => `Filtreeri ${column}`,
    en: (column: string) => `Filter ${column}`,
    ru: (column: string) => `Фильтр по ${column}`,
  },
  "table.columns": {
    description: "Default label of the columns visibility trigger",
    components: ["Table"],
    et: "Veerud",
    en: "Columns",
    ru: "Колонки",
  },
  "table.expand-row": {
    description: "Label for the expand row toggle (collapsed state)",
    components: ["Table"],
    et: "Laienda rida",
    en: "Expand row",
    ru: "Развернуть строку",
  },
  "table.collapse-row": {
    description: "Label for the expand row toggle (expanded state)",
    components: ["Table"],
    et: "Ahenda rida",
    en: "Collapse row",
    ru: "Свернуть строку",
  },
  "table.drag-column": {
    description: "Accessible label of the column reorder drag handle",
    components: ["Table"],
    et: "Lohista veergu",
    en: "Drag column",
    ru: "Перетащить колонку",
  },
  "table.drag-row": {
    description: "Accessible label of the row reorder drag handle",
    components: ["Table"],
    et: "Lohista rida",
    en: "Drag row",
    ru: "Перетащить строку",
  },
  "table.reorder.pickup": {
    description: "Live region message when a column is picked up for keyboard reordering",
    components: ["Table"],
    et: (column: string) =>
      `Veerg ${column} on valitud. Kasuta vasakut/paremat noolt liigutamiseks ja Tühikut või Sisestust kinnitamiseks. Vajuta Escape tühistamiseks.`,
    en: (column: string) =>
      `Column ${column} picked up. Use Left/Right arrow to move, Space or Enter to drop. Press Escape to cancel.`,
    ru: (column: string) =>
      `Столбец ${column} взят. Используйте стрелки влево/вправо для перемещения, Пробел или Enter для подтверждения. Нажмите Escape для отмены.`,
  },
  "table.reorder.move": {
    description: "Live region message while a picked-up column is moved between positions",
    components: ["Table"],
    et: (column: string, position: number) =>
      `Veerg ${column} positsioonil ${position}.`,
    en: (column: string, position: number) =>
      `Column ${column} at position ${position}.`,
    ru: (column: string, position: number) =>
      `Столбец ${column} на позиции ${position}.`,
  },
  "table.reorder.drop": {
    description: "Live region message when a column is dropped",
    components: ["Table"],
    et: (column: string, position: number) =>
      `Veerg ${column} paigutatud positsioonile ${position}.`,
    en: (column: string, position: number) =>
      `Column ${column} moved to position ${position}.`,
    ru: (column: string, position: number) =>
      `Столбец ${column} перемещен на позицию ${position}.`,
  },
  "table.reorder.cancel": {
    description: "Live region message when column reorder is cancelled",
    components: ["Table"],
    et: "Veeru ümberjärjestamine tühistatud.",
    en: "Column reordering cancelled.",
    ru: "Перестановка столбцов отменена.",
  },
  "table.row-reorder.pickup": {
    description: "Live region message when a row is picked up for keyboard reordering",
    components: ["Table"],
    et: (position: number) =>
      `Rida ${position} on valitud. Kasuta üles-/allanoolt liigutamiseks ja Tühikut või Sisestust kinnitamiseks. Vajuta Escape tühistamiseks.`,
    en: (position: number) =>
      `Row ${position} picked up. Use Up/Down arrow to move, Space or Enter to drop. Press Escape to cancel.`,
    ru: (position: number) =>
      `Строка ${position} взята. Используйте стрелки вверх/вниз для перемещения, Пробел или Enter для подтверждения. Нажмите Escape для отмены.`,
  },
  "table.row-reorder.move": {
    description: "Live region message while a picked-up row is moved between positions",
    components: ["Table"],
    et: (position: number) => `Rida liigutatud positsioonile ${position}.`,
    en: (position: number) => `Row moved to position ${position}.`,
    ru: (position: number) => `Строка перемещена на позицию ${position}.`,
  },
  "table.row-reorder.drop": {
    description: "Live region message when a row is dropped",
    components: ["Table"],
    et: (position: number) => `Rida paigutatud positsioonile ${position}.`,
    en: (position: number) => `Row dropped at position ${position}.`,
    ru: (position: number) => `Строка размещена на позиции ${position}.`,
  },
  "table.row-reorder.cancel": {
    description: "Live region message when row reorder is cancelled",
    components: ["Table"],
    et: "Ridade ümberjärjestamine tühistatud.",
    en: "Row reordering cancelled.",
    ru: "Перестановка строк отменена.",
  },
  "tooltip.icon-trigger": {
    description: "Label we use for icons that are tooltip triggers",
    components: ["TooltipTrigger"],
    et: "Kuva tööriistavihje",
    en: "Show tooltip",
    ru: "Показать подсказку",
  },
  "info-button.label": {
    description: "Info button default label",
    components: ["InfoButton"],
    et: "Lisainfo",
    en: "More information",
    ru: "Дополнительная информация",
  },
  "pagination.title": {
    description: "Label of the pagination",
    components: ["Table", "Pagination"],
    et: "Pagineerimine",
    en: "Pagination",
    ru: "Страницы",
  },
  "pagination.page": {
    description: "Label of individual page numbers",
    components: ["Table", "Pagination"],
    et: (page: number, isCurrent?: boolean) =>
      isCurrent ? `Aktiivne leht, leht ${page}` : `Mine lehele ${page}`,
    en: (page: number, isCurrent?: boolean) =>
      isCurrent ? `Current page, page ${page}` : `Go to page ${page}`,
    ru: (page: number, isCurrent?: boolean) =>
      isCurrent
        ? `Текущая страница, страница ${page}`
        : `Перейти на страницу ${page}`,
  },
  "pagination.prev-page": {
    description: "Previous page button label",
    components: ["Table", "Pagination"],
    et: "Eelmine leht",
    en: "Previous page",
    ru: "Предыдущая страница",
  },
  "pagination.next-page": {
    description: "Next page button label",
    components: ["Table", "Pagination"],
    et: "Järgmine leht",
    en: "Next page",
    ru: "Следущая страница",
  },
  "pagination.results": {
    description:
      "Total results text. Returns the full localised string with count embedded — locales decide their own word order.",
    components: ["Table", "Pagination"],
    et: (count?: number) => `${count ?? 0} ${count === 1 ? "tulemus" : "tulemust"}`,
    en: (count?: number) => `${count ?? 0} ${count === 1 ? "result" : "results"}`,
    ru: (count?: number) => `${count ?? 0} ${count === 1 ? "результат" : "результа"}`,
  },
  "pagination.page-size": {
    description: "Label of page size select",
    components: ["Table", "Pagination"],
    et: "Kuva korraga",
    en: "Show per page",
    ru: "Показывать по",
  },
  "pagination.page-status": {
    description:
      "Status message announced to screen readers via an aria-live region when the page changes.",
    components: ["Pagination"],
    et: (page?: number, total?: number) => `Lehekülg ${page ?? 0} / ${total ?? 0}`,
    en: (page?: number, total?: number) => `Page ${page ?? 0} of ${total ?? 0}`,
    ru: (page?: number, total?: number) => `Страница ${page ?? 0} из ${total ?? 0}`,
  },
  "pagination.page-title": {
    description:
      "Title of the mobile page-jump picker modal, shown when `showModalTitle` is enabled.",
    components: ["Pagination"],
    et: "Vali lehekülg",
    en: "Select page",
    ru: "Выбрать страницу",
  },
  "pagination.page-size-title": {
    description:
      "Title of the mobile page-size picker modal, shown when `showModalTitle` is enabled.",
    components: ["Pagination"],
    et: "Tulemusi lehel",
    en: "Results per page",
    ru: "Результатов на странице",
  },
  "table-of-contents.title": {
    description: "Title of the table of contents",
    components: ["TableOfContents"],
    et: "Sisukord",
    en: "Table of contents",
    ru: "Содержание",
  },
  "table-of-contents.valid": {
    description: "Number of valid steps",
    components: ["TableOfContents"],
    et: (count: string | number) => `${count} valiidsed`,
    en: (count: string | number) => `${count} valid`,
    ru: (count: string | number) => `${count} действительны`,
  },
  "table-of-contents.invalid": {
    description: "Number of invalid steps",
    components: ["TableOfContents"],
    et: (count: string | number) => `${count} mitte valiidne`,
    en: (count: string | number) => `${count} invalid`,
    ru: (count: string | number) => `${count} неверный`,
  },
  "truncate.see-more": {
    description: "See more button label",
    components: ["Truncate"],
    et: "Näita rohkem",
    en: "Show more",
    ru: "Показать больше",
  },
  "truncate.see-less": {
    description: "See less button label",
    components: ["Truncate"],
    et: "Näita vähem",
    en: "Show less",
    ru: "Скрыть",
  },
  "vertical-progress.edit": {
    description: "Edit button label",
    components: ["VerticalProgressItem"],
    et: "Muuda",
    en: "Edit",
    ru: "редактировать",
  },
  "numberField.decrement": {
    description: "Label for screen-reader for number field decrease button",
    components: ["NumberField"],
    et: (count: string | number) => `Vähenda ${count} võrra`,
    en: (count: string | number) => `Decrease by ${count}`,
    ru: (count: string | number) => `Уменьшить на ${count}`,
  },
  "numberField.increment": {
    description: "Label for screen-reader for number field increase button",
    components: ["NumberField"],
    et: (count: string | number) => `Suurenda ${count} võrra`,
    en: (count: string | number) => `Increase by ${count}`,
    ru: (count: string | number) => `Увеличить на ${count}`,
  },
  "numberField.quantityUpdated": {
    description:
      "Label for screen-reader when quantity get updated by button click",
    components: ["NumberField"],
    et: (count: string | number) => `Uuendatud. Uus väärtus ${count}`,
    en: (count: string | number) => `Updated. New value ${count}`,
    ru: (count: string | number) => `Ууэндатуд. Уус вяэртус ${count}`,
  },
  "sidenav.backToMainMenu": {
    description: "Side navigation label",
    components: ["Sidenav"],
    et: "Tagasi peamenüüsse",
    en: "Back to main menu",
    ru: "Назад в главное меню",
  },
  "sidenav.toggle": {
    description: "Label for sidenav toggle on mobile",
    components: ["Sidenav"],
    et: (isOpen: boolean) => (isOpen ? "Sulge menüü" : "Ava menüü"),
    en: (isOpen: boolean) => (isOpen ? "Close menu" : "Open menu"),
    ru: (isOpen: boolean) => (isOpen ? "Закрыть меню" : "Открыть меню"),
  },
  "sidenav.toggleSubmenu": {
    description: "Label for sidenav submenu toggle",
    components: ["Sidenav"],
    et: (value: string, isOpen: boolean) =>
      `${isOpen ? "Sulge" : "Ava"} ${value} alammenüü`,
    en: (value: string, isOpen: boolean) =>
      `${isOpen ? "Close" : "Open"} ${value} submenu`,
    ru: (value: string, isOpen: boolean) =>
      `${isOpen ? "Закрыть" : "Открыть"} ${value} подменю`,
  },
  "buttonGroup.menu": {
    description: "Fallback label for ButtonGroup mobile dropdown trigger",
    components: ["ButtonGroup"],
    et: "Menüü",
    en: "Menu",
    ru: "Меню",
  },
  carousel: {
    description: "Label for carousel",
    components: ["CarouselContent"],
    et: "Karussell",
    en: "Carousel",
    ru: "Карусель",
  },
  "carousel.slide": {
    description: "Label for carousel slide",
    components: ["CarouselContent"],
    et: (slideNumber: number, totalNumber: number) =>
      `Slaid ${slideNumber} / ${totalNumber}`,
    en: (slideNumber: number, totalNumber: number) =>
      `Slide ${slideNumber} of ${totalNumber}`,
    ru: (slideNumber: number, totalNumber: number) =>
      `Слайд ${slideNumber} из ${totalNumber}`,
  },
  "carousel.moveForward": {
    description: "Label for carousel next button",
    components: ["CarouselIndicators", "CarouselNavigation"],
    et: "Liigu edasi",
    en: "Move forward",
    ru: "Двигаться вперед",
  },
  "carousel.moveBack": {
    description: "Label for carousel previous button",
    components: ["CarouselIndicators", "CarouselNavigation"],
    et: "Liigu tagasi",
    en: "Move back",
    ru: "Двигаться назад",
  },
  "carousel.showSlide": {
    description: "Label for carousel slide indicator",
    components: ["CarouselIndicators"],
    et: (slideNumber: number) => `Vaata slaidi ${slideNumber}`,
    en: (slideNumber: number) => `Show slide ${slideNumber}`,
    ru: (slideNumber: number) => `Показать слайд ${slideNumber}`,
  },
  "date-picker.january": {
    description: "Label for january month",
    components: ["DatePicker"],
    et: "Jaanuar",
    en: "January",
    ru: "Январь",
  },
  "date-picker.february": {
    description: "Label for february month",
    components: ["DatePicker"],
    et: "Veebruar",
    en: "February",
    ru: "Февраль",
  },
  "date-picker.march": {
    description: "Label for march month",
    components: ["DatePicker"],
    et: "Märts",
    en: "March",
    ru: "Март",
  },
  "date-picker.april": {
    description: "Label for april month",
    components: ["DatePicker"],
    et: "Aprill",
    en: "April",
    ru: "Апрель",
  },
  "date-picker.may": {
    description: "Label for may month",
    components: ["DatePicker"],
    et: "Mai",
    en: "May",
    ru: "Май",
  },
  "date-picker.june": {
    description: "Label for june month",
    components: ["DatePicker"],
    et: "Juuni",
    en: "June",
    ru: "Июнь",
  },
  "date-picker.july": {
    description: "Label for july month",
    components: ["DatePicker"],
    et: "Juuli",
    en: "July",
    ru: "Июль",
  },
  "date-picker.august": {
    description: "Label for august month",
    components: ["DatePicker"],
    et: "August",
    en: "August",
    ru: "Август",
  },
  "date-picker.september": {
    description: "Label for september month",
    components: ["DatePicker"],
    et: "September",
    en: "September",
    ru: "Сентябрь",
  },
  "date-picker.october": {
    description: "Label for october month",
    components: ["DatePicker"],
    et: "Oktoober",
    en: "October",
    ru: "Октябрь",
  },
  "date-picker.november": {
    description: "Label for november month",
    components: ["DatePicker"],
    et: "November",
    en: "November",
    ru: "Ноябрь",
  },
  "date-picker.december": {
    description: "Label for december month",
    components: ["DatePicker"],
    et: "Detsember",
    en: "December",
    ru: "Декабрь",
  },
  "date-picker.january-short": {
    description: "Short label for january month",
    components: ["DatePicker"],
    et: "Jaan",
    en: "Jan",
    ru: "Янв",
  },
  "date-picker.february-short": {
    description: "Short label for february month",
    components: ["DatePicker"],
    et: "Veebr",
    en: "Feb",
    ru: "Фев",
  },
  "date-picker.march-short": {
    description: "Short label for march month",
    components: ["DatePicker"],
    et: "Märts",
    en: "Mar",
    ru: "Мар",
  },
  "date-picker.april-short": {
    description: "Short label for april month",
    components: ["DatePicker"],
    et: "Apr",
    en: "Apr",
    ru: "Апр",
  },
  "date-picker.may-short": {
    description: "Short label for may month",
    components: ["DatePicker"],
    et: "Mai",
    en: "May",
    ru: "Май",
  },
  "date-picker.june-short": {
    description: "Short label for june month",
    components: ["DatePicker"],
    et: "Juuni",
    en: "Jun",
    ru: "Июн",
  },
  "date-picker.july-short": {
    description: "Short label for july month",
    components: ["DatePicker"],
    et: "Juuli",
    en: "Jul",
    ru: "Июл",
  },
  "date-picker.august-short": {
    description: "Short label for august month",
    components: ["DatePicker"],
    et: "Aug",
    en: "Aug",
    ru: "Авг",
  },
  "date-picker.september-short": {
    description: "Short label for september month",
    components: ["DatePicker"],
    et: "Sept",
    en: "Sep",
    ru: "Сен",
  },
  "date-picker.october-short": {
    description: "Short label for october month",
    components: ["DatePicker"],
    et: "Okt",
    en: "Oct",
    ru: "Окт",
  },
  "date-picker.november-short": {
    description: "Short label for november month",
    components: ["DatePicker"],
    et: "Nov",
    en: "Nov",
    ru: "Ноя",
  },
  "date-picker.december-short": {
    description: "Short label for december month",
    components: ["DatePicker"],
    et: "Dets",
    en: "Dec",
    ru: "Дек",
  },
  "date-picker.monday": {
    description: "Label for Monday",
    components: ["DatePicker"],
    et: "Esmaspäev",
    en: "Monday",
    ru: "Понедельник",
  },
  "date-picker.tuesday": {
    description: "Label for Tuesday",
    components: ["DatePicker"],
    et: "Teisipäev",
    en: "Tuesday",
    ru: "Вторник",
  },
  "date-picker.wednesday": {
    description: "Label for Wednesday",
    components: ["DatePicker"],
    et: "Kolmapäev",
    en: "Wednesday",
    ru: "Среда",
  },
  "date-picker.thursday": {
    description: "Label for Thursday",
    components: ["DatePicker"],
    et: "Neljapäev",
    en: "Thursday",
    ru: "Четверг",
  },
  "date-picker.friday": {
    description: "Label for Friday",
    components: ["DatePicker"],
    et: "Reede",
    en: "Friday",
    ru: "Пятница",
  },
  "date-picker.saturday": {
    description: "Label for Saturday",
    components: ["DatePicker"],
    et: "Laupäev",
    en: "Saturday",
    ru: "Суббота",
  },
  "date-picker.sunday": {
    description: "Label for Sunday",
    components: ["DatePicker"],
    et: "Pühapäev",
    en: "Sunday",
    ru: "Воскресенье",
  },
  "date-picker.monday-short": {
    description: "Short label for Monday",
    components: ["DatePicker"],
    et: "E",
    en: "Mon",
    ru: "Пн",
  },
  "date-picker.tuesday-short": {
    description: "Short label for Tuesday",
    components: ["DatePicker"],
    et: "T",
    en: "Tue",
    ru: "Вт",
  },
  "date-picker.wednesday-short": {
    description: "Short label for Wednesday",
    components: ["DatePicker"],
    et: "K",
    en: "Wed",
    ru: "Ср",
  },
  "date-picker.thursday-short": {
    description: "Short label for Thursday",
    components: ["DatePicker"],
    et: "N",
    en: "Thu",
    ru: "Чт",
  },
  "date-picker.friday-short": {
    description: "Short label for Friday",
    components: ["DatePicker"],
    et: "R",
    en: "Fri",
    ru: "Пт",
  },
  "date-picker.saturday-short": {
    description: "Short label for Saturday",
    components: ["DatePicker"],
    et: "L",
    en: "Sat",
    ru: "Сб",
  },
  "date-picker.sunday-short": {
    description: "Short label for Sunday",
    components: ["DatePicker"],
    et: "P",
    en: "Sun",
    ru: "Вс",
  },
  "date-picker.today": {
    description:
      "Prefix announced by assistive tech before the date when a day cell represents today (e.g., \"Today, Friday, 16 May 2026\").",
    components: ["DatePicker"],
    et: "Täna",
    en: "Today",
    ru: "Сегодня",
  },
  "date-picker.go-next-month": {
    description: "Label for next month navigation",
    components: ["DatePicker"],
    et: "Järgmine kuu",
    en: "Next month",
    ru: "Следующий месяц",
  },
  "date-picker.calendar-nav": {
    description:
      "ARIA label for the calendar navigation toolbar (prev/next + month/year selectors).",
    components: ["DatePicker"],
    et: "Kalendri navigeerimine",
    en: "Calendar navigation",
    ru: "Навигация по календарю",
  },
  "date-picker.choose-month": {
    description: "ARIA label for the month-picker grid.",
    components: ["DatePicker"],
    et: "Vali kuu",
    en: "Choose month",
    ru: "Выберите месяц",
  },
  "date-picker.choose-year": {
    description: "ARIA label for the year-picker grid.",
    components: ["DatePicker"],
    et: "Vali aasta",
    en: "Choose year",
    ru: "Выберите год",
  },
  "date-picker.week-number": {
    description:
      "ARIA label announced for the ISO week-number cell at the start of each row.",
    components: ["DatePicker"],
    et: (n: number) => `Nädal ${n}`,
    en: (n: number) => `Week ${n}`,
    ru: (n: number) => `Неделя ${n}`,
  },
  "date-picker.week-number-header": {
    description:
      "ARIA label announced for the week-number column header (e.g., \"Week\").",
    components: ["DatePicker"],
    et: "Nädal",
    en: "Week",
    ru: "Неделя",
  },
  "date-picker.go-prev-month": {
    description: "Label for previous month navigation",
    components: ["DatePicker"],
    et: "Eelmine kuu",
    en: "Previous month",
    ru: "Предыдущий месяц",
  },
  "date-picker.select-month": {
    description: "Label for month selection dropdown",
    components: ["DatePicker"],
    et: "Vali kuu",
    en: "Select month",
    ru: "Выберите месяц",
  },
  "date-picker.select-year": {
    description: "Label for year selection dropdown",
    components: ["DatePicker"],
    et: "Vali aasta",
    en: "Select year",
    ru: "Выберите год",
  },
  "date-picker.clear-date": {
    description:
      "Label for the button that clears the selected date from the input field.",
    components: ["DatePicker"],
    et: "Tühjenda kuupäev",
    en: "Clear date",
    ru: "Очистить дату",
  },
  "date-picker.open-calendar": {
    description: "Label for the button that opens the date picker calendar.",
    components: ["DatePicker"],
    et: "Ava kalender",
    en: "Open calendar",
    ru: "Открыть календарь",
  },
  "date-picker.previous-years": {
    description: "Label for showing previous years in year-grid.",
    components: ["DatePicker"],
    et: "Eelnevad aastad",
    en: "Previous years",
    ru: "Предыдущие годы",
  },
  "date-picker.next-years": {
    description: "Label for showing next years in year-grid.",
    components: ["DatePicker"],
    et: "Järgmised aastad",
    en: "Next years",
    ru: "Следующие годы",
  },
  "date-field.remove-chip": {
    description:
      "Label for the remove button on a selected-date chip inside the date field.",
    components: ["DateField"],
    et: (label: string) => `Eemalda ${label}`,
    en: (label: string) => `Remove ${label}`,
    ru: (label: string) => `Удалить ${label}`,
  },
  "date-field.calendar-dialog": {
    description:
      "ARIA label for the calendar popover dialog opened from the date field.",
    components: ["DateField"],
    et: "Vali kuupäev",
    en: "Choose date",
    ru: "Выберите дату",
  },
  "date-field.modal-title": {
    description: "Title shown in the mobile date picker modal header.",
    components: ["DateField"],
    et: "Kuupäev",
    en: "Date",
    ru: "Дата",
  },
  "date-field.confirm": {
    description:
      "Label for the confirm button in the mobile date picker modal.",
    components: ["DateField"],
    et: "Kinnita",
    en: "Confirm",
    ru: "Подтвердить",
  },
  "date-field.cancel": {
    description:
      "Label for the cancel button in the mobile date picker modal.",
    components: ["DateField"],
    et: "Tühista",
    en: "Cancel",
    ru: "Отмена",
  },
  "time-picker.hours": {
    description: "Aria label for the hours listbox in the time picker.",
    components: ["TimePicker"],
    et: "Tunnid",
    en: "Hours",
    ru: "Часы",
  },
  "time-picker.minutes": {
    description: "Aria label for the minutes listbox in the time picker.",
    components: ["TimePicker"],
    et: "Minutid",
    en: "Minutes",
    ru: "Минуты",
  },
  "time-field.clear": {
    description:
      "Label for the button that clears the selected time from the input field.",
    components: ["TimeField"],
    et: "Tühjenda kellaaeg",
    en: "Clear time",
    ru: "Очистить время",
  },
  "time-field.select-time": {
    description: "Label for the button that selects time.",
    components: ["TimeField"],
    et: "Vali kellaaeg",
    en: "Select time",
    ru: "Выбрать время",
  },
  "time-field.modal-title": {
    description: "Title shown in the mobile time picker modal header.",
    components: ["TimeField"],
    et: "Kellaaeg",
    en: "Time",
    ru: "Время",
  },
  "time-field.confirm": {
    description:
      "Label for the confirm button in the mobile time picker modal.",
    components: ["TimeField"],
    et: "Kinnita",
    en: "Confirm",
    ru: "Подтвердить",
  },
  "time-field.cancel": {
    description:
      "Label for the cancel button in the mobile time picker modal.",
    components: ["TimeField"],
    et: "Tühista",
    en: "Cancel",
    ru: "Отмена",
  },
  "time-picker.no-slots": {
    description:
      "Empty-state message shown in the slots/dropdown time picker when no time slots have been provided.",
    components: ["TimePicker", "TimeField"],
    et: "Aegu ei ole määratud",
    en: "No times available",
    ru: "Нет доступных вариантов",
  },
  "vertical-stepper.completed": {
    description:
      "Label for screen-reader that this step is completed (visually hidden)",
    components: ["VerticalStepper"],
    et: "Lõpetatud",
    en: "Completed",
    ru: "Завершено",
  },
  "vertical-stepper.error": {
    description:
      "Label for screen-reader that this step has error (visually hidden)",
    components: ["VerticalStepper"],
    et: "Puudulik",
    en: "Error",
    ru: "Oшибка",
  },
};

export type TediTranslationsMap<L extends Language> = {
  [K in keyof typeof translationsMap]: (typeof translationsMap)[K][L];
};

export type TranslationEntry = {
  description?: string;
  components?: string[];
} & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [L in Language]: string | ((...args: any[]) => string);
};

export type TranslationMap = Record<string, TranslationEntry>;
