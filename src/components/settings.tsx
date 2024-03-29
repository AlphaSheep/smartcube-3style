import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../state/hooks';
import {
  PieceType,
  getAvailableBuffers,
  getAvailablePieceTypes,
  selectBuffer,
  selectIncludeInverses,
  selectIncludeTwists,
  selectLetterScheme,
  selectSelectedLetters,
  selectSelectedPieceType,
  setBuffer,
  setIncludeInverses,
  setIncludeTwists,
  setLetterScheme,
  setSelectedLetters,
  setSelectedPieceType
} from '../state/settings.duck';

import './settings.less';

export default function Settings({ closeSettings }) {
  return <>
    <div className="container">
      <h1>Settings</h1>
    </div>

    <div className="settings-page">
      <PieceTypeSelector />
      <IncludeInverses />
      {/* <IncludeTwists /> */}
      <LetterScheme />
      <BufferSettings />
      <SelectedLetters />
      <div className='settings-close-button'>
        <button className='btn btn-primary'
          onClick={closeSettings}>Done</button>

      </div>
    </div>
  </>
}

function PieceTypeSelector() {
  const dispatch = useAppDispatch();

  const pieceType = useAppSelector(selectSelectedPieceType);
  const availablePieceTypes = getAvailablePieceTypes();

  const onChange = (piece: PieceType) => {
    dispatch(setSelectedPieceType(piece));
  }

  return <div className="piece-type-selector">
    {availablePieceTypes.map((piece) => {
      return <button
          className={piece === pieceType ? 'btn btn-primary' : 'btn btn-default'}
          key={piece}
          onClick={() => onChange(piece)}
        >
          {piece}
        </button>
    })}
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
      <input type="checkbox" onChange={onUpdate} checked={includeInverses} />
      Include inverses
    </label>
  </div>;
}

function IncludeTwists() {
  const dispatch = useAppDispatch();

  const includeTwists = useAppSelector(selectIncludeTwists);

  const onUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setIncludeTwists(event.target.checked));
  }

  return <div className="include-twists">
    <label>
      <input type="checkbox" onChange={onUpdate} checked={includeTwists} />
      Include twists
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
  const [error, setError] = useState('');

  const letterScheme = useAppSelector(selectLetterScheme);

  const onUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length !== 24 || /\s/.test(value)) {
      setError('Input must contain exactly 24 printable characters and no whitespace.');
      dispatch(setLetterScheme(value));
    } else {
      setError('');
      dispatch(setLetterScheme(value));
    }
  }

  return <div className="letter-scheme">
    <label>
      Letter scheme
      <input type="text" onChange={onUpdate} value={letterScheme} />
    </label>
    {error && <p className="error">{error}</p>}
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
