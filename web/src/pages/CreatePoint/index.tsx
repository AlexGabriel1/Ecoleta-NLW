import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";

import "./styles.css";

import logo from "../../assets/logo.svg";

import { Link, useHistory } from "react-router-dom";

import { FiArrowLeft } from "react-icons/fi";

import { Map, TileLayer, Marker } from "react-leaflet";

import { LeafletMouseEvent } from "leaflet";

import api from "../../services/api";

import axios from "axios";

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface UFs {
  sigla: string;
}
interface City {
  nome: string;
}

const CreatePoint = () => {
  const History = useHistory();

  const [items, setItems] = useState<Item[]>([]);

  const [cidades, setCidades] = useState<string[]>([]);
  const [Ufs, setUfs] = useState<string[]>([]);

  const [selectedUF, setSelectedUF] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");
  const [selectItems, setSelectedItems] = useState<number[]>([]);
  const [selectPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  useEffect(() => {
    api.get("items").then((response) => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<UFs[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => {
        const siglaEstados = response.data.map((item) => item.sigla);
        setUfs(siglaEstados);
      });
  }, []);

  useEffect(() => {
    axios
      .get<City[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`
      )
      .then((response) => {
        const cidades = response.data.map((item) => item.nome);
        setCidades(cidades);
      });
  }, [selectedUF]);

  function handleSelectedUf(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedUF(e.target.value);
  }
  function handleSelectedCity(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(e.target.value);
  }

  function handleMapClick(e: LeafletMouseEvent) {
    setSelectedPosition([e.latlng.lat, e.latlng.lng]);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleClickItem(id: number) {
    const selected = selectItems.findIndex((item) => item === id);

    if (selected === -1) {
      setSelectedItems([...selectItems, id]);
    } else {
      const filtredItems = selectItems.filter((item) => item !== id);
      setSelectedItems(filtredItems);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;

    const uf = selectedUF;
    const city = selectedCity;
    const [latitude, longitude] = selectPosition;
    const items = selectItems;

    const Data = {
      name,
      email,
      whatsapp,
      city,
      uf,
      latitude,
      longitude,
      items,
    };

    await api.post("points", Data);
  }

  return (
    <>
      <div id="page-create-point">
        <header>
          <img src={logo} alt="Ecoleta" />
          <Link to="/">
            {" "}
            <FiArrowLeft />
            Voltar
          </Link>
        </header>

        <form onSubmit={handleSubmit}>
          <h1>
            Cadastro do <br /> Ponto de coleta{" "}
          </h1>

          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>

            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <input
                type="text"
                name="name"
                id="name"
                onChange={handleInputChange}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
            </legend>

            <div className="field-group">
              <div className="field">
                <label htmlFor="name">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleInputChange}
                />
              </div>
              <div className="field">
                <label htmlFor="name">WhatsApp</label>
                <input
                  type="text"
                  name="whatsapp"
                  id="whatsapp"
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione o endereço no mapa</span>
            </legend>

            <Map
              center={[-15.6449822, -56.0584489]}
              zoom={15}
              onClick={handleMapClick}
            >
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={selectPosition} />
            </Map>

            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select
                  name="uf"
                  id="uf"
                  value={selectedUF}
                  onChange={handleSelectedUf}
                >
                  <option value="0">Selecione uma UF</option>
                  {Ufs.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select
                  name="cidade"
                  id="cidade"
                  onChange={handleSelectedCity}
                  value={selectedCity}
                >
                  <option value="0">Selecione uma cidade</option>
                  {cidades.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Ítens de coleta</h2>
              <span>Selecione um ou mais itens abaixo</span>
            </legend>
            <ul className="items-grid">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={selectItems.includes(item.id) ? "selected" : ""}
                  onClick={() => handleClickItem(item.id)}
                >
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </fieldset>
          <button type="submit">Cadastrar ponto de coleta</button>
        </form>
      </div>
    </>
  );
};

export default CreatePoint;
