'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase"; //from firebase js file
import { Box, Modal, Typography, Stack, TextField, Button } from '@mui/material'
import {collection, deleteDoc, getDocs, query, setDoc, doc, getDoc} from 'firebase/firestore'


//main component for this project
export default function Home() {
  //variables 
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false) //for add or remove
  const [itemName, setItemName] = useState('')

  //helper functions

  //for updating from firebase
  const updateInventory = async () => {
    //get collection snapshot from firestore database
    const snapshot = query(collection(firestore, 'inventory'))
    //get documents from that collection
    const docs = await getDocs(snapshot)
    const inventoryList = []
    //go through each key value pair in documents
    docs.forEach((doc) => {
      inventoryList.push(
        {
          name: doc.id,
          ...doc.data(),
        }
      )
    })
    setInventory(inventoryList)
  }


  //for adding item into firestore database
  const addItem = async (item) => {
    //get reference of item from firestore
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    }
    else {
      await setDoc(docRef, {quantity: 1})
    }

    await updateInventory()
  }

  //for deleting from firestore database
  const removeItem = async (item) => {
    //get reference of item from firestore
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const {quantity} = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }

    await updateInventory()
  }

  //control functions
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  
  //run whenever something changes in dependency
  useEffect( () => {
    updateInventory()
  }, 
  [] //meaning run only once at beginning
  )

  return (
    //100vw to  mean 100% of width of component
    <Box 
      width={"100vw"} 
      height={"100vh"} 
      display={"flex"} 
      bgcolor={"white"}
      flexDirection={"column"} //make content up and down one after another
      justifyContent={"center"} 
      alignItems={"center"}
      gap={2}
    > 
      <Modal open={open} onClose={handleClose}>
        <Box
          position={"absolute"}
          top={"50%"}
          left={"50%"}
          width={400}
          bgcolor={"white"}
          border={"2px solid #000"}
          boxShadow={24}
          p={4}
          display={"flex"}
          flexDirection={"column"}
          gap={3}
          //directly process as style rather than props
          sx={{
            transform: "translate(-50%,-50%)"
          }}
        >
          <Typography variant="h6" color={"black"}>Add Item</Typography>
          <Stack width={"100%"} direction={"row" } spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value)
              }}
            >
            </TextField>
            <Button
              variant="outlined"
              onClick={ () => {
                //add item to database
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      
      <Button
        variant="contained"
        onClick={() => {
          handleOpen()
        }}
      >
        Add New Item
      </Button>

      <Box border={'1px solid #333'}>
    
        <Box 
          width={'800px'} 
          height={'100px'} 
          bgcolor={'#ADD8E6'} 
          display={'flex'}  //to allow centering
          justifyContent={'center'} 
          alignItems={'center'}
        >
          <Typography variant="h2" color={'#333'} textAlign={'center'}>
            Items
          </Typography>
        </Box>

        <Stack width={'800px'} height={'300px'} spacing={2} overflow={'auto'}>

          {inventory.map(({name, quantity}) =>(
              <Box
                key={name}
                width={'100%'}
                minHeight={'150px'}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'space-between'}
                bgcolor={'#f0f0f0'}
                paddingX={5}
              >
                <Typography
                  variant="h3"
                  color={'#333'}
                  textAlign={'center'}
                >
                  {
                    name.charAt(0).toUpperCase() + name.slice(1)
                  }
                </Typography>
                
                <Typography 
                  variant="h3" 
                  color={'#333'}
                  textAlign={'center'}
                >
                  {quantity}
                </Typography>

                <Stack
                  direction={"row"}
                  spacing={2}  
                >
                  <Button
                    variant="contained"
                    onClick={() => {
                      addItem(name)
                    }}
                  >
                    Add
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => {
                      removeItem(name)
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
          ))}
      </Stack>
      </Box>
    </Box>
  );
}
