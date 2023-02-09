const discounts = {
  'od1tp5': {
    'uttar pradesh': {
      bike: 65,
      scooter: 70,
      declined: null
    },
    'uttrakhand': {
      bike: 60,
      scooter: 60,
      declined: null
    },
    'gujarat': {
      bike: 60,
      scooter: 60,
      declined: ['royal enfield']
    },
    'maharashtra': {
      mumbai: {
        bike: 80,
        scooter: 80,
        declined: null
      },
      bike: 50,
      scooter: 50,
      declined: null
    },
    'karnataka': {
      bike: 60,
      scooter: 60,
      declined: null
    },
    'telangana': {
      bike: 60,
      scooter: 60,
      declined: ['royal enfield']
    },
    'andhra pradesh': {
      bike: 60,
      scooter: 60,
      declined: ['royal enfield']
    },
    'delhi': {
      bike: 75,
      scooter: 75,
      declined: null
    },
    'west bengal': {
      bike: 60,
      scooter: 60,
      declined: null
    },
    'jharkhand': {
      bike:60,
      scooter: 60,
      declined: null
    }
  },
  'renewal': {
    vehicleAge: {
      3: {
        state: {
          'uttar pradesh': {
            cc: {
              150: {
                bike: 50,
                scooter: 50
              },
              151: {
                bike: 40,
                scooter: 40
              }
            }
          },
          'uttrakhand': {
            cc: {
              150: {
                bike: 40,
                scooter: 40
              },
              151: {
                bike: 35,
                scooter: 35
              }
            }
          },
          'gujarat': {
            cc: {
              150: {
                bike: 50,
                scooter: 50
              },
              151: {
                bike: 40,
                scooter: 40
              }
            }
          },
          'maharashtra': {
            cc: {
              mumbai: {
                150: {
                  bike: 60,
                  scooter: 60
                },
                151: {
                  bike: 50,
                  scooter: 50
                }
              },
              150: {
                bike: 30,
                scooter: 30 
              },
              151: {
                bike: 30,
                scooter: 30 
              }
            }
          },
          'karnataka': {
            cc: {
              150: {
                bike: 50,
                scooter: 50
              },
              151: {
                bike: 40,
                scooter: 40
              }
            }
          },
          'telangana': {
            cc: {
              150: {
                bike: 50,
                scooter: 50
              },
              151: {
                bike: 40,
                scooter: 40,
                exceptions : {
                  honda: {
                    bike: 50,
                    scooter: 50
                  },
                  'royal enfield': {
                    bike: 50,
                    scooter: 50
                  }
                }
              }
            }
          },
          'andhra pradesh': {
            cc: {
              150: {
                bike: 50,
                scooter: 50
              },
              151: {
                bike: 40,
                scooter: 40,
                exceptions : {
                  honda: {
                    bike: 50,
                    scooter: 50
                  },
                  'royal enfield': {
                    bike: 50,
                    scooter: 50
                  }
                }
              }
            }
          },
          'delhi': {
            cc: {
              150: {
                bike: 40,
                scooter: 40
              },
              151: {
                bike: 35,
                scooter: 35
              }
            }
          },
          'west bengal': {
            cc: {
              150: {
                bike: 50,
                scooter: 50
              },
              151: {
                bike: 40,
                scooter: 40
              }
            }
          },
          'jharkhand': {
            cc: {
              150: {
                bike: 50,
                scooter: 50
              },
              151: {
                bike: 40,
                scooter: 40
              }
            }
          },
          'bihar': {
            cc: {
              150: {
                bike: 50,
                scooter: 50
              },
              151: {
                bike: 40,
                scooter: 40
              }
            }
          }
        }
      },
      9: {
        state: {
          'uttar pradesh': {
            cc: {
              150: {
                bike: 45,
                scooter: 45
              },
              151: {
                bike: 35,
                scooter: 35
              }
            }
          },
          'uttrakhand': {
            cc: {
              150: {
                bike: 35,
                scooter: 35
              },
              151: {
                bike: 25,
                scooter: 25
              }
            }
          },
          'gujarat': {
            cc: {
              150: {
                bike: 45,
                scooter: 45
              },
              151: {
                bike: 35,
                scooter: 35,
                exceptions: {
                  honda: {
                    bike: 40,
                    scooter: 40
                  },
                  'royal enfield': {
                    bike: 40,
                    scooter: 40
                  }
                }
              }
            }
          },
          'maharashtra': {
            cc: {
              mumbai: {
                150: {
                  bike: 45,
                  scooter: 45
                },
                151: {
                  bike: 35,
                  scooter: 35
                }
              },
              150: {
                bike: 30,
                scooter: 30 
              },
              151: {
                bike: 30,
                scooter: 30 
              }
            }
          },
          'karnataka': {
            cc: {
              150: {
                bike: 45,
                scooter: 45
              },
              151: {
                bike: 35,
                scooter: 35
              }
            }
          },
          'telangana': {
            cc: {
              150: {
                bike: 45,
                scooter: 45
              },
              151: {
                bike: 35,
                scooter: 35,
                exceptions : {
                  honda: {
                    bike: 45,
                    scooter: 45
                  },
                  'royal enfield': {
                    bike: 45,
                    scooter: 45
                  }
                }
              }
            }
          },
          'andhra pradesh': {
            cc: {
              150: {
                bike: 45,
                scooter: 45
              },
              151: {
                bike: 35,
                scooter: 35,
                exceptions : {
                  honda: {
                    bike: 45,
                    scooter: 45
                  },
                  'royal enfield': {
                    bike: 45,
                    scooter: 45
                  }
                }
              }
            }
          },
          'delhi': {
            cc: {
              150: {
                bike: 35,
                scooter: 35
              },
              151: {
                bike: 25,
                scooter: 25
              }
            }
          },
          'west bengal': {
            cc: {
              150: {
                bike: 45,
                scooter: 45
              },
              151: {
                bike: 35,
                scooter: 35
              }
            }
          },
          'jharkhand': {
            cc: {
              150: {
                bike: 45,
                scooter: 45
              },
              151: {
                bike: 35,
                scooter: 35
              }
            }
          },
          'bihar': {
            cc: {
              150: {
                bike: 45,
                scooter: 45
              },
              151: {
                bike: 35,
                scooter: 35
              }
            }
          }
        }
      },
      12: {
        state: {
          'uttar pradesh': {
            cc: {
              150: {
                bike: 40,
                scooter: 40
              },
              151: {
                bike: 30,
                scooter: 30
              }
            }
          },
          'uttrakhand': {
            cc: {
              150: {
                bike: 30,
                scooter: 30
              },
              151: {
                bike: 20,
                scooter: 20
              }
            }
          },
          'gujarat': {
            cc: {
              150: {
                bike: 40,
                scooter: 40
              },
              151: {
                bike: 30,
                scooter: 30
              }
            }
          },
          'maharashtra': {
            cc: {
              mumbai: {
                150: {
                  bike: 40,
                  scooter: 40
                },
                151: {
                  bike: 30,
                  scooter: 30
                }
              },
              150: {
                bike: 30,
                scooter: 30 
              },
              151: {
                bike: 30,
                scooter: 30 
              }
            }
          },
          'karnataka': {
            cc: {
              150: {
                bike: 40,
                scooter: 40
              },
              151: {
                bike: 30,
                scooter: 30
              }
            }
          },
          'telangana': {
            cc: {
              150: {
                bike: 40,
                scooter: 40
              },
              151: {
                bike: 30,
                scooter: 30,
                exceptions : {
                  honda: {
                    bike: 40,
                    scooter: 40
                  },
                  'royal enfield': {
                    bike: 40,
                    scooter: 40
                  }
                }
              }
            }
          },
          'andhra pradesh': {
            cc: {
              150: {
                bike: 40,
                scooter: 40
              },
              151: {
                bike: 30,
                scooter: 30,
                exceptions : {
                  honda: {
                    bike: 40,
                    scooter: 40
                  },
                  'royal enfield': {
                    bike: 40,
                    scooter: 40
                  }
                }
              }
            }
          },
          'delhi': {
            cc: {
              150: {
                bike: 30,
                scooter: 30
              },
              151: {
                bike: 20,
                scooter: 20
              }
            }
          },
          'west bengal': {
            cc: {
              150: {
                bike: 40,
                scooter: 40
              },
              151: {
                bike: 30,
                scooter: 30
              }
            }
          },
          'jharkhand': {
            cc: {
              150: {
                bike: 40,
                scooter: 40
              },
              151: {
                bike: 30,
                scooter: 30
              }
            }
          },
          'bihar': {
            cc: {
              150: {
                bike: 40,
                scooter: 40
              },
              151: {
                bike: 30,
                scooter: 30
              }
            }
          }
        }
      },
    }
  }
};

export default discounts;