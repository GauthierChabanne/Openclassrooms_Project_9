/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import { bills } from "../fixtures/bills.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
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
    test("Then new bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      //to-do write expect expression
      expect(windowIcon.classList.length).toBeGreaterThan(0)
    })
  })
  describe("When i am on NewBill page and click on Send Button", () => {
    test("Then a new bill should be created", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const bill = new Bills({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })
      const handleClickNewBill = jest.fn(bill.handleClickNewBill)
      await waitFor(() => screen.getByTestId('btn-new-bill'))
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillButton)
      expect(handleClickNewBill).toHaveBeenCalled()
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
    })
  })
})
