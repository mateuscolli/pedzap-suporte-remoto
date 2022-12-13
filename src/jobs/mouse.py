import sys
import pyautogui

print(sys.argv)
try:
    mouseEvent = sys.argv[1]
    mouseWhich = sys.argv[2]
    mouseX = sys.argv[3]
    mouseY = sys.argv[4]

    if mouseEvent == 'mousedown':
        pyautogui.mouseDown(x=float(mouseX), y=float(mouseY), button=mouseWhich)

    if mouseEvent == 'mouseup':
        pyautogui.mouseDown(x=float(mouseX), y=float(mouseY), button=mouseWhich)
    
except:
    pass