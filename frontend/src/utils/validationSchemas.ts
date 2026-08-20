import * as yup from 'yup'

// ── Pago Inicial ──────────────────────────────────────────────
export const schemaStep1Inicial = yup.object({
  voucher: yup
    .string()
    .required('Este campo es obligatorio.')
    .matches(/^\d+$/, 'Solo se permiten dígitos numéricos.')
    .length(6, 'Debe tener exactamente 6 dígitos numéricos.'),
  primerNombre: yup.string().required('Este campo es obligatorio.').trim(),
  segundoNombre: yup.string().optional(),
  primerApellido: yup.string().required('Este campo es obligatorio.').trim(),
  segundoApellido: yup.string().optional(),
})

// ── Pago Parcial ──────────────────────────────────────────────
export const schemaStep1Parcial = yup.object({
  buscarPor: yup.string().required('Este campo es obligatorio.'),
  valorBusqueda: yup.string().required('Este campo es obligatorio.').trim(),
})

// ── Step 2: Confirmação / Seleção de Opção ────────────────────
export const schemaStep2 = yup.object({
  opcionSeleccionada: yup.string().nullable().required('Seleccione una opción de pago.'),
})

// ── Step 3: Não há campos de formulário livres — é só confirmação ──
export const schemaStep3 = yup.object({})
