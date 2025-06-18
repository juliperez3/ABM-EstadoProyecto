"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, AlertCircle, CheckCircle, Settings, ArrowLeft, AlertTriangle } from "lucide-react"

// Tipos de datos
interface EstadoProyecto {
  codEstadoProyecto: string
  nombreEstadoProyecto: string
  fechaBajaEstadoProyecto: Date | null
}

interface Proyecto {
  id: number
  nombre: string
  codEstadoProyecto: string
}

// Estados válidos según el documento
const ESTADOS_VALIDOS = ["Creado", "Iniciado", "En evaluacion", "Suspendido", "Cancelado", "Finalizado"]

// Componente personalizado para el ícono de éxito
const GreenCheckIcon = ({ className = "w-16 h-16" }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Light green background circle */}
      <div className="absolute inset-0 bg-green-100 rounded-full" style={{ backgroundColor: "#dcfce7" }} />
      {/* Green checkmark icon */}
      <CheckCircle className="relative text-green-600 w-2/5 h-2/5" style={{ color: "#16a34a" }} strokeWidth={2} />
    </div>
  )
}

// Componente personalizado para el ícono de advertencia amarillo
const YellowWarningIcon = ({ className = "w-16 h-16" }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Smaller light yellow background circle */}
      <div className="absolute inset-2 bg-yellow-100 rounded-full" />
      {/* Yellow/amber warning icon matching the text color */}
      <AlertCircle className={`relative text-yellow-700 w-2/5 h-2/5`} strokeWidth={2} />
    </div>
  )
}

export default function ABMEstadoProyecto() {
  // Estados principales
  const [estados, setEstados] = useState<EstadoProyecto[]>([])
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [currentView, setCurrentView] = useState<string>("lista")
  const [selectedEstado, setSelectedEstado] = useState<EstadoProyecto | null>(null)
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error" | "info" | "warning"
    message: string
  } | null>(null)
  const [errorEnConfirmacion, setErrorEnConfirmacion] = useState<string>("")

  // Inicializar datos de ejemplo
  useEffect(() => {
    const estadosIniciales: EstadoProyecto[] = [
      { codEstadoProyecto: "EST001", nombreEstadoProyecto: "Creado", fechaBajaEstadoProyecto: null },
      { codEstadoProyecto: "EST002", nombreEstadoProyecto: "Iniciado", fechaBajaEstadoProyecto: null },
      { codEstadoProyecto: "EST003", nombreEstadoProyecto: "En evaluacion", fechaBajaEstadoProyecto: null },
      { codEstadoProyecto: "EST004", nombreEstadoProyecto: "Suspendido", fechaBajaEstadoProyecto: null },
      { codEstadoProyecto: "EST005", nombreEstadoProyecto: "Cancelado", fechaBajaEstadoProyecto: null },
    ]

    const proyectosIniciales: Proyecto[] = [
      { id: 1, nombre: "Proyecto Alpha", codEstadoProyecto: "EST001" },
      { id: 2, nombre: "Proyecto Beta", codEstadoProyecto: "EST002" },
      { id: 3, nombre: "Proyecto Gamma", codEstadoProyecto: "EST003" },
    ]

    setEstados(estadosIniciales)
    setProyectos(proyectosIniciales)
  }, [])

  // Funciones de utilidad
  const showAlert = (type: "success" | "error" | "info" | "warning", message: string) => {
    setAlertMessage({ type, message })
    setTimeout(() => setAlertMessage(null), 5000)
  }

  const getNextCodigo = () => {
    const nextNum = Math.max(...estados.map((e) => Number.parseInt(e.codEstadoProyecto.replace("EST", ""), 0) + 1))
    return `EST${nextNum.toString().padStart(3, "0")}`
  }

  // Validaciones
  const validarNombreEstadoAgregar = (nombre: string): boolean => {
    if (!nombre || nombre.trim() === "") return false
    // Para agregar: verificar que sea uno de los estados válidos predefinidos
    return ESTADOS_VALIDOS.includes(nombre)
  }

  const validarNombreEstadoModificar = (nombre: string): boolean => {
    if (!nombre || nombre.trim() === "") return false

    // Para modificar: verificar que no contenga números
    if (/\d/.test(nombre)) return false

    // Verificar que no contenga caracteres especiales (solo letras, espacios y acentos)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) return false

    return true
  }

  const existeEstado = (nombre: string, excludeId?: string): boolean => {
    return estados.some(
      (e) =>
        e.nombreEstadoProyecto === nombre && e.fechaBajaEstadoProyecto === null && e.codEstadoProyecto !== excludeId,
    )
  }

  const estadoAsignadoAProyecto = (codEstado: string): boolean => {
    return proyectos.some((p) => p.codEstadoProyecto === codEstado)
  }

  // Handlers para las acciones
  const handleAgregar = () => {
    setCurrentView("form-agregar")
  }

  const handleModificar = (estado: EstadoProyecto) => {
    setSelectedEstado(estado)
    setCurrentView("form-modificar")
  }

  const handleBaja = (estado: EstadoProyecto) => {
    setSelectedEstado(estado)
    setErrorEnConfirmacion("")
    setCurrentView("confirmar-baja")
  }

  const handleConfirmarBaja = () => {
    if (!selectedEstado) return

    if (estadoAsignadoAProyecto(selectedEstado.codEstadoProyecto)) {
      setErrorEnConfirmacion("Este estado no puede darse de baja porque está asignado a un proyecto")
      return
    }

    setEstados(
      estados.map((e) =>
        e.codEstadoProyecto === selectedEstado.codEstadoProyecto ? { ...e, fechaBajaEstadoProyecto: new Date() } : e,
      ),
    )

    setSelectedEstado(null)
    setErrorEnConfirmacion("")
    setCurrentView("operacion-exitosa-baja")
  }

  const handleCancelarBaja = () => {
    setSelectedEstado(null)
    setErrorEnConfirmacion("")
    setCurrentView("operacion-cancelada")
  }

  // Renderizado de componentes según la vista actual
  const renderCurrentView = () => {
    switch (currentView) {
      case "lista":
        return <ListaEstados />
      case "form-agregar":
        return <FormularioAgregar />
      case "form-modificar":
        return <FormularioModificar />
      case "confirmar-baja":
        return <ConfirmarBaja />
      case "operacion-exitosa":
        return <OperacionExitosa />
      case "operacion-cancelada":
        return <OperacionCancelada />
      case "operacion-exitosa-modificacion":
        return <OperacionExitosaModificacion />
      case "operacion-exitosa-baja":
        return <OperacionExitosaBaja />
      default:
        return <ListaEstados />
    }
  }

  // GUI N°1: Lista de Estados
  const ListaEstados = () => (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-2xl font-bold">ABM Estado Proyecto</CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1">
                Administración de estados de proyecto
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleAgregar}
            size="sm"
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white mr-4"
          >
            <Plus className="h-4 w-4" />
            Agregar Estado
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="w-24 text-sm font-medium text-gray-600 text-center">Código</TableHead>
                <TableHead className="w-72 text-sm font-medium text-gray-600 text-center">Nombre del Estado</TableHead>
                <TableHead className="w-96 text-sm font-medium text-gray-600 text-center">Fecha de Baja</TableHead>
                <TableHead className="w-8 text-center text-sm font-medium text-gray-600">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estados.map((estado) => (
                <TableRow key={estado.codEstadoProyecto} className="border-b hover:bg-gray-50">
                  <TableCell className="py-3 font-mono text-sm text-center">{estado.codEstadoProyecto}</TableCell>
                  <TableCell className="py-3 text-sm font-medium text-center">{estado.nombreEstadoProyecto}</TableCell>
                  <TableCell className="py-3 text-sm text-gray-600 text-center">
                    {estado.fechaBajaEstadoProyecto?.toLocaleDateString() || "-"}
                  </TableCell>
                  <TableCell className="py-3">
                    {!estado.fechaBajaEstadoProyecto && (
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModificar(estado)}
                          className="text-xs text-gray-600 hover:text-gray-900 h-8 bg-white"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Modificar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBaja(estado)}
                          className="text-xs text-gray-600 hover:text-gray-900 h-8 bg-white"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Dar de Baja
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )

  // GUI N°3: Formulario Agregar (Réplica estética de Modificar)
  const FormularioAgregar = () => {
    const [inputValue, setInputValue] = useState("")
    const [fieldError, setFieldError] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = () => {
      const nombre = inputValue.trim()

      // CA N°2: Datos Inconsistentes - Verificar que sea un estado válido
      if (!nombre || !validarNombreEstadoAgregar(nombre)) {
        setFieldError("Los datos ingresados no son válidos. Intenta nuevamente.")
        setInputValue("")
        return
      }

      // CA N°3: Estado Existente - Verificar que no exista ya
      if (existeEstado(nombre)) {
        setFieldError("Ya existe un Estado con ese nombre. Intente nuevamente")
        setInputValue("")
        return
      }

      // Crear nueva instancia de EstadoProyecto
      const nuevoEstado: EstadoProyecto = {
        codEstadoProyecto: getNextCodigo(),
        nombreEstadoProyecto: nombre,
        fechaBajaEstadoProyecto: null,
      }

      setEstados([...estados, nuevoEstado])
      setCurrentView("operacion-exitosa")
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      if (fieldError) {
        setFieldError("")
      }
    }

    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="px-6 py-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-green-600" />
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-gray-900">Agregar Estado Proyecto</h1>
              <p className="text-base text-gray-500">Ingrese el nombre del Estado</p>
            </div>

            <div className="w-full space-y-3">
              <div>
                <Label htmlFor="nombre" className="text-sm font-medium text-gray-900">
                  Nombre del Estado <span className="text-red-500">*</span>
                </Label>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    marginTop: "8px",
                    outline: "none",
                  }}
                  placeholder="Creado, Iniciado, En evaluacion, Suspendido, Cancelado, Finalizado"
                />

                {fieldError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700">{fieldError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setCurrentView("lista")}
                className="flex-1 h-10 text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-10 text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
              >
                Agregar Estado
              </Button>
            </div>

            <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="text-base font-semibold text-blue-600 mb-4">Ejemplos para prueba:</h3>
              <ul className="text-sm text-blue-600 space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">•</span>
                  <span>Ingrese "Finalizado" para simular alta.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">•</span>
                  <span>Ingrese números o caracteres especiales para simular datos no válidos.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">•</span>
                  <span>Ingrese el nombre actual o un nombre en uso para simular estado existente.</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // GUI N°8: Formulario Modificar
  const FormularioModificar = () => {
    const [inputValue, setInputValue] = useState("")
    const [fieldError, setFieldError] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = () => {
      if (!selectedEstado) return

      const nombre = inputValue.trim()

      if (!nombre) {
        setFieldError("Los datos ingresados no son válidos. Intenta nuevamente.")
        setInputValue("")
        return
      }

      if (!validarNombreEstadoModificar(nombre)) {
        setFieldError("Los datos ingresados no son válidos. Intenta nuevamente.")
        setInputValue("")
        return
      }

      // Verificar si el nombre es el mismo que ya tenía el estado
      if (nombre === selectedEstado.nombreEstadoProyecto) {
        setFieldError("Ya existe un Estado con ese nombre. Intente nuevamente")
        setInputValue("")
        return
      }

      if (existeEstado(nombre, selectedEstado.codEstadoProyecto)) {
        setFieldError("Ya existe un Estado con ese nombre. Intente nuevamente")
        setInputValue("")
        return
      }

      setEstados(
        estados.map((e) =>
          e.codEstadoProyecto === selectedEstado.codEstadoProyecto ? { ...e, nombreEstadoProyecto: nombre } : e,
        ),
      )

      setSelectedEstado(null)
      setCurrentView("operacion-exitosa-modificacion")
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      if (fieldError) {
        setFieldError("")
      }
    }

    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="px-6 py-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Edit className="h-6 w-6 text-blue-600" />
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-gray-900">Modificar Estado Proyecto</h1>
              <p className="text-base text-gray-500">Código: {selectedEstado?.codEstadoProyecto}</p>
            </div>

            <div className="w-full space-y-3">
              <div>
                <Label htmlFor="nombre" className="text-sm font-medium text-gray-900">
                  Nombre del Estado <span className="text-red-500">*</span>
                </Label>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    marginTop: "8px",
                    outline: "none",
                  }}
                  placeholder={`Nombre Actual: ${selectedEstado?.nombreEstadoProyecto}`}
                />

                {fieldError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700">{fieldError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setCurrentView("lista")}
                className="flex-1 h-10 text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-10 text-sm font-medium bg-black hover:bg-gray-800 text-white"
              >
                Modificar Estado
              </Button>
            </div>

            <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-6 mt-4">
              <h3 className="text-base font-semibold text-blue-600 mb-4">Ejemplos para prueba:</h3>
              <ul className="text-sm text-blue-600 space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">•</span>
                  <span>Ingrese un nombre para continuar.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">•</span>
                  <span>Ingrese números o caracteres especiales para simular datos no válidos.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">•</span>
                  <span>Ingrese el nombre actual o un nombre en uso para simular estado existente.</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // GUI N°11: Confirmar Baja
  const ConfirmarBaja = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="px-6 py-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-gray-900">Confirmar Baja</h1>
            <p className="text-base text-gray-500">Confirme si desea dar de baja el estado del Proyecto</p>
          </div>

          <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-700">Estado seleccionado:</p>
              <p className="text-sm text-red-600">
                <span className="font-medium">Código:</span> {selectedEstado?.codEstadoProyecto}
              </p>
              <p className="text-sm text-red-600">
                <span className="font-medium">Nombre:</span> {selectedEstado?.nombreEstadoProyecto}
              </p>
            </div>
          </div>

          {errorEnConfirmacion && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-700">{errorEnConfirmacion}</span>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={handleCancelarBaja} className="flex-1 h-10 text-sm font-medium">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarBaja}
              className="flex-1 h-10 text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Nueva GUI: Operación Exitosa
  const OperacionExitosa = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4">
      <div className="container mx-auto py-0">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sistema de Prácticas Profesionales</h1>
        </div>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-lg mx-auto bg-white shadow-lg">
            <CardContent className="px-8 py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 flex items-center justify-center">
                  <GreenCheckIcon className="w-20 h-20" />
                </div>

                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-green-800">Operación Exitosa</h1>
                </div>

                <div className="w-full bg-white border border-gray-200 rounded-xl p-3 mt-12">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 relative">
                      <CheckCircle className="w-6 h-6 text-black stroke-[2px]" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-sm text-gray-800 font-medium">¡Estado dado de alta exitosamente!</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 w-full pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView("lista")}
                    className="w-full h-12 text-sm font-medium border-gray-300 hover:bg-gray-50"
                  >
                    Nueva Operación
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // Nueva GUI: Operación Cancelada
  const OperacionCancelada = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4">
      <div className="container mx-auto py-0">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sistema de Prácticas Profesionales</h1>
        </div>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-lg mx-auto bg-white shadow-lg">
            <CardContent className="px-8 py-12">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-20 h-20 flex items-center justify-center">
                  <YellowWarningIcon className="w-20 h-20" />
                </div>

                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-yellow-700">Operación Cancelada</h1>
                </div>

                <div className="w-full bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <AlertCircle className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 text-center">
                      <span className="text-sm">Operación cancelada. No se dio de baja el estado</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 w-full pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView("lista")}
                    className="w-full h-12 text-sm font-medium border-gray-300 hover:bg-gray-50"
                  >
                    Nueva Operación
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // Nueva GUI: Operación Exitosa Modificación
  const OperacionExitosaModificacion = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4">
      <div className="container mx-auto py-0">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sistema de Prácticas Profesionales</h1>
        </div>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-lg mx-auto bg-white shadow-lg">
            <CardContent className="px-8 py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 flex items-center justify-center">
                  <GreenCheckIcon className="w-20 h-20" />
                </div>

                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-green-800">Operación Exitosa</h1>
                </div>

                <div className="w-full bg-white border border-gray-200 rounded-xl p-3 mt-12">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 relative">
                      <CheckCircle className="w-6 h-6 text-black stroke-[2px]" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-sm text-gray-800 font-medium">¡Estado modificado exitosamente!</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 w-full pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView("lista")}
                    className="w-full h-12 text-sm font-medium border-gray-300 hover:bg-gray-50"
                  >
                    Nueva Operación
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // Nueva GUI: Operación Exitosa Baja (Duplicado 100% igual a Modificación)
  const OperacionExitosaBaja = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4">
      <div className="container mx-auto py-0">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sistema de Prácticas Profesionales</h1>
        </div>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-lg mx-auto bg-white shadow-lg">
            <CardContent className="px-8 py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 flex items-center justify-center">
                  <GreenCheckIcon className="w-20 h-20" />
                </div>

                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-green-800">Operación Exitosa</h1>
                </div>

                <div className="w-full bg-white border border-gray-200 rounded-xl p-3 mt-12">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 relative">
                      <CheckCircle className="w-6 h-6 text-black stroke-[2px]" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-sm text-gray-800 font-medium">¡Estado dado de baja exitosamente!</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 w-full pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView("lista")}
                    className="w-full h-12 text-sm font-medium border-gray-300 hover:bg-gray-50"
                  >
                    Nueva Operación
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto py-6">
        {currentView === "operacion-exitosa" ||
        currentView === "operacion-cancelada" ||
        currentView === "operacion-exitosa-baja" ? (
          renderCurrentView()
        ) : (
          <>
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Sistema de Prácticas Profesionales</h1>
            </div>

            {alertMessage && (
              <div className="mb-6">
                <Alert
                  className={`max-w-6xl mx-auto ${
                    alertMessage.type === "success"
                      ? "border-green-200 bg-green-50"
                      : alertMessage.type === "error"
                        ? "border-red-200 bg-red-50"
                        : alertMessage.type === "warning"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-blue-200 bg-blue-50"
                  }`}
                >
                  {alertMessage.type === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : alertMessage.type === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription
                    className={`${
                      alertMessage.type === "success"
                        ? "text-green-800"
                        : alertMessage.type === "error"
                          ? "text-red-800"
                          : alertMessage.type === "warning"
                            ? "text-yellow-800"
                            : "text-blue-800"
                    }`}
                  >
                    {alertMessage.message}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="mt-8">{renderCurrentView()}</div>
          </>
        )}
      </div>
    </div>
  )
}
