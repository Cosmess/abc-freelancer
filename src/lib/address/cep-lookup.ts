type CepAddress = {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
};

function setInputValue(form: HTMLFormElement, name: string, value: string) {
  const input = form.elements.namedItem(name);

  if (input instanceof HTMLInputElement && value) {
    input.value = value;
  }
}

export async function fillAddressFromCep(form: HTMLFormElement, cepValue: string) {
  const cep = cepValue.replace(/\D/g, "");

  if (cep.length !== 8) {
    return;
  }

  const response = await fetch(`/api/lookup/cep?cep=${cep}`);

  if (!response.ok) {
    return;
  }

  const address = (await response.json()) as CepAddress;

  setInputValue(form, "cep", address.cep);
  setInputValue(form, "state", address.state);
  setInputValue(form, "city", address.city);
  setInputValue(form, "neighborhood", address.neighborhood);
  setInputValue(form, "street", address.street);
}
