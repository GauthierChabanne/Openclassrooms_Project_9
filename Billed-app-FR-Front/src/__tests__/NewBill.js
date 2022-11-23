/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import { bills } from "../fixtures/bills.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Bills from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
  })
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("Then new bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      //to-do write expect expression
      expect(windowIcon.classList.length).toBeGreaterThan(0)
    })
    describe("When i am on NewBill page, click on choose file and enter an invalid document", () => {
      test("Then the file shouldn't be added", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const newBill = new NewBill({
          document, onNavigate, store, bills, localStorage: window.localStorage
        })
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        await waitFor(() => screen.getAllByTestId('file'))
        const fileInputs = screen.getAllByTestId('file')
        fileInputs.forEach((fileInput) => {
          fileInput.addEventListener('change', handleChangeFile)
          fireEvent.change(fileInput, { target: { files: "test.fr" } })
          expect(handleChangeFile).toHaveBeenCalled()
          expect(fileInput.value.length).toEqual(0)
        })
      })
    })
    describe("When i am on NewBill page, click on choose file and enter a valid document", () => {
      test("Then a new bill should be created", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const newBill = new NewBill({
          document, onNavigate, store, bills, localStorage: window.localStorage
        })
        const previousBillsLength = bills.length
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        await waitFor(() => screen.getAllByTestId('file'))
        const fileInputs = screen.getAllByTestId('file')
        fileInputs.forEach((fileInput) => {
          fileInput.addEventListener('change', handleChangeFile)
          fireEvent.change(fileInput, {target: {files:"test.jpg"}})
          expect(handleChangeFile).toHaveBeenCalled()
          expect(fileInput.files.length).toBeGreaterThan(0)
        })
        expect(mockStore.bills().list()).toEqual(previousBillsLength + 1)
      })
    })
    describe("When i am on NewBill page and click on Send Button", () => {
      test("Then a the new bill should be updated", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const newBill = new NewBill({
          document, onNavigate, store, bills, localStorage: window.localStorage
        })
        const handleSubmit = jest.fn(newBill.handleSubmit)
        await waitFor(() => screen.getAllByTestId('form-new-bill'))
        const formsNewBill = screen.getAllByTestId('form-new-bill')
        formsNewBill.forEach((formNewBill) => {
          formNewBill.addEventListener("submit", handleSubmit)
          fireEvent.submit(formNewBill)
          expect(handleSubmit).toHaveBeenCalled()
        })
      })
    })
  })
})
// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBill and valid a new bill", () => {
    test("saves and post new bill to mock API POST", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId("exampleTable"))
      const table = await screen.getByTestId("exampleTable")
      const previousTableLength = table.rows.length

      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getAllByTestId('file'))
      const fileInputs = screen.getAllByTestId('file')
      fileInputs.forEach((fileInput) => {
        fireEvent.change(fileInput, { target: { files: "test.png" } })
      })

      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId("exampleTable"))
      const newTable = await screen.getByTestId("exampleTable")
      expect(newTable.rows.length).toBeGreaterThan(previousTableLength)
    })
  })
})
