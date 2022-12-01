/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor, within } from "@testing-library/dom"
import "@testing-library/jest-dom";
import userEvent from '@testing-library/user-event'
import { bills } from "../fixtures/bills.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Bills from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

const data = []
const loading = false
const error = null

const constructNewBill = () => {
  return new NewBill({
    document,
    onNavigate,
    store: mockStore,
    localStorage: window.localStorage,
  });
};

beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "a@a",
    })
  );
});

beforeEach(() => {
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();

  document.body.innerHTML = NewBillUI();

  window.onNavigate(ROUTES_PATH.NewBill);
});

afterEach(() => {
  jest.resetAllMocks();
  document.body.innerHTML = "";
});


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then new bill icon in vertical layout should be highlighted", async () => {
      const windowIcon = screen.getByTestId('icon-mail')
      //to-do write expect expression
      expect(windowIcon.classList.length).toBeGreaterThan(0)
    })
    describe("When i am on NewBill page, click on choose file and enter an invalid document", () => {
      test("Then the file shouldn't be added", async () => {
        const newBill = constructNewBill
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        await waitFor(() => screen.getByTestId('file'))
        const fileInput = screen.getByTestId('file')
        fileInput.addEventListener('change', handleChangeFile)
        fireEvent.change(fileInput, { target: { files: "test.fr" } })
        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.value.length).toEqual(0)
      })
    })
    describe("When i am on NewBill page, click on choose file and enter a valid document", () => {
      test("Then a file should be added", async () => {

        const newBill = constructNewBill
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        const fileInput = screen.getByTestId('file')
        fileInput.addEventListener('change', handleChangeFile)
        fireEvent.change(fileInput, {target: {files:"test.jpg"}})
        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files.length).toBeGreaterThan(0)
      })
    })
    describe("When I do fill fields in correct format and I click on submit button", () => {
      test("Then a new bill should be created", async () => {
        const createBill = jest.fn(mockStore.bills().create);
        const updateBill = jest.fn(mockStore.bills().update);

        const { fileUrl, key } = await createBill();

        expect(createBill).toHaveBeenCalledTimes(1);

        expect(key).toBe("1234");
        expect(fileUrl).toBe("https://localhost:3456/images/test.jpg");

        const newBill = updateBill();

        expect(updateBill).toHaveBeenCalledTimes(1);

        await expect(newBill).resolves.toEqual({
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl:
            "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          status: "pending",
          type: "Hôtel et logement",
          commentary: "séminaire billed",
          name: "encore",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2004-04-04",
          amount: 400,
          commentAdmin: "ok",
          email: "a@a",
          pct: 20,
        });
      });
    });
    describe("When nothing has been typed in PCT input", () => {
      test("then the PCT should be 20 by default", () => {
        const newBill = constructNewBill();

        const inputData = bills[0];

        const newBillForm = screen.getByTestId("form-new-bill");

        const handleSubmit = jest.spyOn(newBill, "handleSubmit");
        const updateBill = jest.spyOn(newBill, "updateBill");

        newBill.fileName = inputData.fileName;

        newBillForm.addEventListener("submit", handleSubmit);

        fireEvent.submit(newBillForm);

        expect(handleSubmit).toHaveBeenCalledTimes(1);

        expect(updateBill).toHaveBeenCalledWith(
          expect.objectContaining({
            pct: 20,
          })
        );
      });
    });

    //Test d'intégration POST

    describe("When an error occurs on API", () => {
      test("Then new bill is added to the API but fetch fails with '404 page not found' error", async () => {
        const newBill = constructNewBill();

        const mockedBill = jest
          .spyOn(mockStore, "bills")
          .mockImplementationOnce(() => {
            return {
              create: jest.fn().mockRejectedValue(new Error("Erreur 404")),
            };
          });

        await expect(mockedBill().create).rejects.toThrow("Erreur 404");

        expect(mockedBill).toHaveBeenCalledTimes(1);

        expect(newBill.billId).toBeNull();
        expect(newBill.fileUrl).toBeNull();
        expect(newBill.fileName).toBeNull();
      });

      test("Then new bill is added to the API but fetch fails with '500 Internal Server error'", async () => {
        const newBill = constructNewBill();

        const mockedBill = jest
          .spyOn(mockStore, "bills")
          .mockImplementationOnce(() => {
            return {
              create: jest.fn().mockRejectedValue(new Error("Erreur 500")),
            };
          });

        await expect(mockedBill().create).rejects.toThrow("Erreur 500");

        expect(mockedBill).toHaveBeenCalledTimes(1);

        expect(newBill.billId).toBeNull();
        expect(newBill.fileUrl).toBeNull();
        expect(newBill.fileName).toBeNull();
      });
    });
  });
});
