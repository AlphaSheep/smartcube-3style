import React from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import {
  PieceType,
  getAvailableBuffers,
  getAvailablePieceTypes,
  selectBuffer,
  selectIncludeInverses,
  selectLetterScheme,
  selectSelectedLetters,
  selectSelectedPieceType,
  setBuffer,
  setIncludeInverses,
  setLetterScheme,
  setSelectedLetters,
  setSelectedPieceType
} from '../state/settings';


export default function Settings() {
  return <>
    <div className="container">
      <h1>Settings</h1>
    </div>

    <div className="settings-page">
      <PieceTypeSelector/>
      <IncludeInverses/>
      <BufferSettings/>
      <LetterScheme/>
      <SelectedLetters/>
    </div>
  </>
}

function PieceTypeSelector() {
  const dispatch = useAppDispatch();

  const pieceType = useAppSelector(selectSelectedPieceType);
  const availablePieceTypes = getAvailablePieceTypes();

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSelectedPieceType(event.target.value as PieceType));
  }

  return <div className="piece-type-selector">
    <select value={pieceType} onChange={onChange}>
      {availablePieceTypes.map((piece) => {
        return <option key={piece} value={piece}>{piece}</option>
      })}
    </select>
  </div>;
}

function IncludeInverses() {
  const dispatch = useAppDispatch();

  const includeInverses = useAppSelector(selectIncludeInverses);

  const onUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setIncludeInverses(event.target.checked));
  }

  return <div className="include-inverses">
    <label>
      <input type="checkbox" onChange={onUpdate} checked={includeInverses}/>
      Include inverses
    </label>
  </div>;
}

function BufferSettings() {
  const dispatch = useAppDispatch();

  const pieceType = useAppSelector(selectSelectedPieceType);
  const buffer = useAppSelector(selectBuffer);
  const availableBuffers = getAvailableBuffers(pieceType);

  const onUpdate = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setBuffer(event.target.value));
  }

  return <div className="buffer-settings">
    <label>
      Buffer
      <select onChange={onUpdate} value={buffer}>
        {availableBuffers.map((option) => {
          return <option key={option} value={option}>{option}</option>
        })}
      </select>
    </label>
  </div>;
}

function LetterScheme() {
  const dispatch = useAppDispatch();

  const letterScheme = useAppSelector(selectLetterScheme);

  const onUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setLetterScheme(event.target.value));
  }

  return <div className="letter-scheme">
    <label>
      Letter scheme
      <input type="text" onChange={onUpdate} value={letterScheme}/>
    </label>
  </div>;
}

function SelectedLetters() {
  const dispatch = useAppDispatch();

  const letterScheme = useAppSelector(selectLetterScheme);
  const selectedLetters = useAppSelector(selectSelectedLetters);
  const availableLetters = letterScheme.split('');

  const onUpdate = (event: React.ChangeEvent<HTMLSelectElement>) => {
    let selectedOptions: string[] = [];
    for (let i = 0; i < event.target.selectedOptions.length; i++) {
      selectedOptions.push(event.target.selectedOptions[i].value);
    }

    if (selectedOptions.includes('all')) {
      if (selectedLetters.length < availableLetters.length) {
        selectedOptions = availableLetters;
      } else {
        selectedOptions = [];
      }
    }

    dispatch(setSelectedLetters(selectedOptions));

    if (selectedOptions.length === availableLetters.length) {
      selectedOptions = ['all'].concat(selectedOptions);
    }
  }

  return <div className="selected-letters">
    <label>
      Selected letters
      <select className="selected-letters" onChange={onUpdate} value={selectedLetters} multiple={true}>
        <option value="all">All</option>
        {availableLetters.map((letter) => {
          return <option key={letter} value={letter}>{letter}</option>
        })}
      </select>
    </label>
  </div>;
}
